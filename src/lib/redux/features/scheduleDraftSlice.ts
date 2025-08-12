// src/lib/redux/features/scheduleDraftSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Prisma } from '@prisma/client';
import type { WizardData, Lesson, ScheduleDraft } from '@/types';

// Type for the raw response from the API, where dates are strings
type ApiScheduleDraft = Omit<ScheduleDraft, 'createdAt' | 'updatedAt'> & {
    createdAt: string;
    updatedAt: string;
    lessons: Lesson[];
};


interface DraftState {
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    saveStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    lastSaved: string | null;
    drafts: ScheduleDraft[];
    activeDraft: ScheduleDraft | null;
}

const initialState: DraftState = {
    status: 'idle',
    saveStatus: 'idle',
    error: null,
    lastSaved: null,
    drafts: [],
    activeDraft: null,
};

const toSerializableDraft = (draft: ApiScheduleDraft): ScheduleDraft  => ({
    ...draft,
    id: draft.id,
    name: draft.name,
    description: draft.description || '', // Ensure description is not null
    isActive: draft.isActive,
    userId: draft.userId,
    schoolId: draft.schoolId,
    createdAt: new Date(draft.createdAt).toISOString(),
    updatedAt: new Date(draft.updatedAt).toISOString(),
    schoolConfig: draft.schoolConfig,
    classes: draft.classes,
    subjects: draft.subjects,
    teachers: draft.teachers,
    classrooms: draft.classrooms,
    grades: draft.grades,
});

// Helper function to build the payload for saving
const buildDraftPayload = (wizardData: WizardData, name: string, description?: string) => {
    return {
        name,
        description,
        schoolConfig: wizardData.school,
        classIds: wizardData.classes.map(c => c.id),
        subjectIds: wizardData.subjects.map(s => s.id),
        teacherIds: wizardData.teachers.map(t => t.id),
        classroomIds: wizardData.rooms.map(r => r.id),
        gradeIds: wizardData.grades.map(g => g.id),
        lessonRequirements: wizardData.lessonRequirements,
        teacherConstraints: wizardData.teacherConstraints,
        subjectRequirements: wizardData.subjectRequirements,
        teacherAssignments: wizardData.teacherAssignments,
        schedule: wizardData.schedule.map(lesson => ({
            ...lesson,
            startTime: new Date(lesson.startTime).toISOString(),
            endTime: new Date(lesson.endTime).toISOString(),
        })),
    };
};


// --- ASYNC THUNKS ---

export const fetchScheduleDraft = createAsyncThunk<
    ScheduleDraft | null, 
    { initialWizardData: WizardData }, 
    { rejectValue: string }
>(
    'scheduleDraft/fetchActive',
    async ({ initialWizardData }, { dispatch, rejectWithValue }) => {
        try {
            console.log("📥 [Thunk] fetchScheduleDraft: Début de la récupération du brouillon actif...");
            const response = await fetch('/api/schedule-drafts?active=true', { credentials: 'include' });
            if (!response.ok) {
                const errorData = await response.json();
                console.error("❌ [Thunk] fetchScheduleDraft: Échec de la récupération du brouillon actif. Erreur API:", errorData);
                return rejectWithValue(errorData.message ?? 'Échec de la récupération du brouillon actif');
            }
            const text = await response.text();
            const activeDraft: ApiScheduleDraft | null = text ? JSON.parse(text) : null;
            
            if (activeDraft) {
                console.log("✅ [Thunk] fetchScheduleDraft: Brouillon actif trouvé en BDD:", activeDraft.name);
                return toSerializableDraft(activeDraft);
            } else {
                console.log("✨ [Thunk] fetchScheduleDraft: Aucun brouillon actif trouvé, création d'un nouveau scénario en mémoire.");
                const now = new Date().toISOString();
                const newInMemoryDraft: ScheduleDraft = {
                    id: `temp_${Date.now()}`,
                    userId: 'temp_user',
                    name: 'Nouveau Scénario',
                    description: 'Scénario de base généré à partir des données de la base de données.',
                    isActive: true,
                    createdAt: now,
                    updatedAt: now,
                    schoolId: initialWizardData.school.id?.toString() || null,
                    schoolConfig: JSON.stringify(initialWizardData.school),
                    classes: JSON.stringify(initialWizardData.classes),
                    subjects: JSON.stringify(initialWizardData.subjects),
                    teachers: JSON.stringify(initialWizardData.teachers),
                    classrooms: JSON.stringify(initialWizardData.rooms),
                    grades: JSON.stringify(initialWizardData.grades),
                };
                return newInMemoryDraft;
            }
        } catch (error) {
            console.error("❌ [Thunk] fetchScheduleDraft: Erreur catastrophique.", error);
            return rejectWithValue(error instanceof Error ? error.message : 'An unknown network error occurred');
        }
    }
);

export const fetchAllDrafts = createAsyncThunk<ScheduleDraft[], void, { rejectValue: string }>(
    'scheduleDraft/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/schedule-drafts', { credentials: 'include' });
            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message ?? 'Échec de la récupération de la liste des brouillons');
            }
            const drafts: ApiScheduleDraft[] = await response.json();
            return drafts.map(toSerializableDraft);
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'An unknown network error occurred');
        }
    }
);

export const createDraft = createAsyncThunk<
    ScheduleDraft,
    { name: string; description?: string; wizardData: WizardData },
    { rejectValue: string }
>(
    'scheduleDraft/create',
    async ({ name, description, wizardData }, { rejectWithValue }) => {
        const draftPayload = buildDraftPayload(wizardData, name, description);

        try {
            const response = await fetch('/api/schedule-drafts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(draftPayload),
                credentials: 'include',
            });
            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message ?? 'Failed to create draft');
            }
            const draft: ApiScheduleDraft = await response.json();
            return toSerializableDraft(draft);
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'An unknown network error occurred');
        }
    }
);


export const saveOrUpdateDraft = createAsyncThunk<
    ScheduleDraft,
    { wizardData: WizardData; activeDraft: ScheduleDraft },
    { rejectValue: string }
>(
    'scheduleDraft/saveOrUpdate',
    async ({ wizardData, activeDraft }, { rejectWithValue }) => {
        const draftPayload = buildDraftPayload(wizardData, activeDraft.name, activeDraft.description);
        
        const isNewDraft = activeDraft.id.startsWith('temp_');
        const url = isNewDraft ? '/api/schedule-drafts' : `/api/schedule-drafts/${activeDraft.id}`;
        const method = isNewDraft ? 'POST' : 'PUT';

        console.log(`💾 [Thunk] saveOrUpdateDraft: Tentative de sauvegarde... Méthode: ${method}, URL: ${url}`);

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(draftPayload),
                credentials: 'include',
            });
            if (!response.ok) {
                const errorData = await response.json();
                console.error("❌ [Thunk] saveOrUpdateDraft: Erreur API lors de la sauvegarde:", errorData);
                return rejectWithValue(errorData.message ?? 'Failed to update draft');
            }
            const draft: ApiScheduleDraft = await response.json();
            console.log("✅ [Thunk] saveOrUpdateDraft: Sauvegarde réussie. Réponse API:", draft.name);
            return toSerializableDraft(draft);
        } catch (error) {
            console.error("❌ [Thunk] saveOrUpdateDraft: Erreur catastrophique lors de la sauvegarde.", error);
            return rejectWithValue(error instanceof Error ? error.message : 'An unknown network error occurred');
        }
    }
);

export const deleteDraft = createAsyncThunk<string, string, { rejectValue: string }>(
    'scheduleDraft/delete',
    async (draftId, { rejectWithValue }) => {
        try {
            const response = await fetch(`/api/schedule-drafts/${draftId}`, { method: 'DELETE', credentials: 'include' });
            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message ?? 'Failed to delete draft');
            }
            return draftId;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Unknown network error occurred');
        }
    }
);

export const activateDraft = createAsyncThunk<ScheduleDraft, string, { rejectValue: string }>(
    'scheduleDraft/activate',
    async (draftId, { rejectWithValue }) => {
         try {
            const response = await fetch(`/api/schedule-drafts/${draftId}/activate`, { method: 'POST', credentials: 'include' });
            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message ?? 'Failed to activate draft');
            }
            const getResponse = await fetch('/api/schedule-drafts?active=true', { credentials: 'include' });
            if (!getResponse.ok) {
                throw new Error("Failed to fetch the newly activated draft data.");
            }
            const draft: ApiScheduleDraft = await getResponse.json();
            return toSerializableDraft(draft);
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Unknown network error occurred');
        }
    }
)

const scheduleDraftSlice = createSlice({
    name: 'scheduleDraft',
    initialState,
    reducers: {
        updateActiveDraftDetails(state, action: PayloadAction<{ name?: string, description?: string }>) {
            if (state.activeDraft) {
                if (action.payload.name !== undefined) {
                    state.activeDraft.name = action.payload.name;
                }
                if (action.payload.description !== undefined) {
                    state.activeDraft.description = action.payload.description;
                }
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchScheduleDraft.pending, (state) => { state.status = 'loading'; })
            .addCase(fetchScheduleDraft.fulfilled, (state, action: PayloadAction<ScheduleDraft | null>) => {
                state.status = 'succeeded';
                state.activeDraft = action.payload;
                if (action.payload) { state.lastSaved = action.payload.updatedAt.toString(); } 
                else { state.lastSaved = null; }
            })
            .addCase(fetchScheduleDraft.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload ?? 'Failed to load draft.';
            })
            .addCase(fetchAllDrafts.fulfilled, (state, action) => {
                state.drafts = action.payload;
            })
            .addCase(createDraft.pending, (state) => { state.saveStatus = 'loading'; })
            .addCase(createDraft.fulfilled, (state, action) => {
                state.saveStatus = 'succeeded';
                const newDraft = action.payload;
                const existingDrafts = state.drafts.map(d => ({ ...d, isActive: false }));
                state.drafts = [ { ...newDraft, isActive: true }, ...existingDrafts ];
                state.activeDraft = { ...newDraft, isActive: true };
                state.lastSaved = newDraft.updatedAt.toString();
                state.status = 'succeeded';
            })
            .addCase(createDraft.rejected, (state, action) => {
                state.saveStatus = 'failed';
                state.error = action.payload ?? 'Failed to save draft.';
            })
            .addCase(saveOrUpdateDraft.pending, (state) => { 
                console.log("🔄 [Slice] saveOrUpdateDraft.pending: Statut de sauvegarde -> 'loading'");
                state.saveStatus = 'loading'; 
            })
            .addCase(saveOrUpdateDraft.fulfilled, (state, action) => {
                state.saveStatus = 'succeeded';
                const updatedDraft = action.payload;
                state.lastSaved = updatedDraft.updatedAt;
                state.activeDraft = updatedDraft;
                
                const draftIndex = state.drafts.findIndex(d => d.id === updatedDraft.id);
                if (draftIndex !== -1) {
                    state.drafts[draftIndex] = updatedDraft;
                } else {
                    const tempIdIndex = state.drafts.findIndex(d => d.id.startsWith('temp_'));
                    if (tempIdIndex !== -1) {
                        state.drafts[tempIdIndex] = updatedDraft;
                    } else {
                        state.drafts.push(updatedDraft);
                    }
                }
                console.log("✅ [Slice] saveOrUpdateDraft.fulfilled: Sauvegarde réussie, état mis à jour pour", updatedDraft.name);
            })
            .addCase(saveOrUpdateDraft.rejected, (state, action) => {
                state.saveStatus = 'failed';
                state.error = action.payload ?? 'Autosave failed.';
                console.error("❌ [Slice] saveOrUpdateDraft.rejected: Erreur de sauvegarde.", action.payload);
            })
            .addCase(deleteDraft.fulfilled, (state, action) => {
                state.drafts = state.drafts.filter(d => d.id !== action.payload);
                if (state.activeDraft?.id === action.payload) {
                    state.activeDraft = null;
                }
            })
            .addCase(activateDraft.fulfilled, (state, action) => {
                state.activeDraft = action.payload;
                state.drafts = state.drafts.map(d => ({
                    ...d,
                    isActive: d.id === action.payload.id,
                }));
                state.status = 'succeeded';
            });
    },
    selectors: {
        selectDraftStatus: (state) => state.status,
        selectSaveStatus: (state) => state.saveStatus,
        selectLastSaved: (state) => state.lastSaved,
        selectAllDrafts: (state) => state.drafts,
        selectActiveDraft: (state) => state.activeDraft,
    },
});

export const { updateActiveDraftDetails } = scheduleDraftSlice.actions;
export const { selectDraftStatus, selectSaveStatus, selectLastSaved, selectAllDrafts, selectActiveDraft } = scheduleDraftSlice.selectors;
export default scheduleDraftSlice.reducer;
