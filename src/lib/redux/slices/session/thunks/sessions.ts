// src/lib/redux/slices/session/thunks/sessions.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { ActiveSession, ClassRoom, Poll, Quiz, SessionParticipant, QuizQuestion } from '../types';
import { SESSION_TEMPLATES } from '@/lib/constants';
import type { SafeUser, Role, SessionTemplatePoll } from '@/types';

export const startSession = createAsyncThunk<ActiveSession, { 
  classId: string; 
  className: string; 
  participantIds: string[]; 
  templateId?: string 
}, { 
  rejectValue: string;
  state: { session: { classes: ClassRoom[] }, auth: { user: SafeUser | null } };
}>(
  'session/startSession',
  async ({ classId, className, participantIds, templateId }, { rejectWithValue, getState }) => {
    const state = getState();
    const host = state.auth.user;
    const selectedClass = state.session.classes.find((c: ClassRoom) => c.id.toString() === classId);

    if (!host || !selectedClass) return rejectWithValue('Host or class data not found');

    const participants: SessionParticipant[] = selectedClass.students
      .filter((s: SessionParticipant) => participantIds.includes(s.id))
      .map((s: SessionParticipant) => ({ 
        ...s, 
        isInSession: true, 
        hasRaisedHand: false, 
        points: s.points || 0, 
        badges: s.badges || [], 
        isMuted: false, 
        breakoutRoomId: null 
      }));
    
    participants.unshift({ 
      id: host.id, 
      name: host.name || host.email, 
      email: host.email, 
      role: 'TEACHER', // Use the enum value
      img: host.img, 
      isOnline: true, 
      isInSession: true, 
      hasRaisedHand: false, 
      points: 0, 
      badges: [], 
      isMuted: false, 
      breakoutRoomId: null 
    });

    let templatePolls: Poll[] = [];
    let templateQuizzes: Quiz[] = [];
    const selectedTemplate = templateId ? SESSION_TEMPLATES.find(t => t.id === templateId) : null;
    
    if (selectedTemplate) {
      templatePolls = selectedTemplate.polls.map((p: SessionTemplatePoll) => ({
        id: `poll_${Date.now()}_${Math.random()}`, 
        question: p.question, 
        options: p.options.map((text: string, i: number) => ({ id: `opt_${i}`, text, votes: [] })), 
        isActive: false, 
        createdAt: new Date().toISOString(), 
        totalVotes: 0
      }));
      
      templateQuizzes = selectedTemplate.quizzes.map((q: Omit<Quiz, 'id' | 'startTime' | 'isActive' | 'currentQuestionIndex' | 'answers' | 'timeRemaining'>) => ({
        id: `quiz_${Date.now()}_${Math.random()}`, 
        title: q.title, 
        questions: q.questions.map((ques: Omit<QuizQuestion, 'id'>, i: number) => ({ ...ques, id: `q_${i}` })), 
        currentQuestionIndex: 0, 
        isActive: false, 
        startTime: new Date().toISOString(), 
        answers: [], 
        timeRemaining: q.questions[0]?.timeLimit || 30
      }));
    }
    
    const initialSessionPayload = {
      sessionType: 'class',
      classId,
      className,
      participants,
      hostId: host.id,
      title: className,
      polls: templatePolls,
      quizzes: templateQuizzes,
    };

    try {
      const response = await fetch('/api/chatroom/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(initialSessionPayload)
      });
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to start session on server');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const startMeeting = createAsyncThunk<ActiveSession, { 
  title: string; 
  participantIds: string[] 
}, { 
  rejectValue: string;
  state: { session: { meetingCandidates: SessionParticipant[] }, auth: { user: SafeUser | null } };
}>(
  'session/startMeeting',
  async ({ title, participantIds }, { rejectWithValue, getState }) => {
    const state = getState();
    const host = state.auth.user;
    const allCandidates = state.session.meetingCandidates;

    if (!host) return rejectWithValue('Host user not found');

    const participants: SessionParticipant[] = allCandidates
      .filter((p: SessionParticipant) => participantIds.includes(p.id))
      .map((p: SessionParticipant) => ({ 
        ...p, 
        isInSession: true, 
        hasRaisedHand: false, 
        points: 0, 
        badges: [], 
        isMuted: false, 
        breakoutRoomId: null 
      }));

    participants.unshift({ 
      id: host.id, 
      name: host.name || host.email, 
      email: host.email, 
      role: 'ADMIN', // Use the enum value
      img: host.img, 
      isOnline: true, 
      isInSession: true, 
      hasRaisedHand: false, 
      points: 0, 
      badges: [], 
      isMuted: false, 
      breakoutRoomId: null 
    });

    const initialSessionPayload = {
      sessionType: 'meeting',
      title,
      participants,
      hostId: host.id,
      className: title,
      classId: '',
      polls: [],
      quizzes: [],
    };

    try {
      const response = await fetch('/api/chatroom/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(initialSessionPayload)
      });
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to start meeting on server');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchSessionState = createAsyncThunk(
  'session/fetchState', 
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/chatroom/sessions/${sessionId}`);
      if (!response.ok) throw new Error('Failed to fetch session state');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const endSession = createAsyncThunk(
  'session/endSession', 
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/chatroom/sessions/${sessionId}/end`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to end session');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);
