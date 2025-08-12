// src/lib/redux/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { SafeUser } from '@/types';

interface AuthState {
  user: SafeUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<SafeUser | null>) => {
      const userEmail = action.payload?.email || 'personne';
      console.log(`🎬 [AuthSlice] Action setUser: Définition de l'utilisateur à '${userEmail}'.`);
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isLoading = false;
    },
    logout: (state) => {
      console.log(`🎬 [AuthSlice] Action logout: Réinitialisation de l'état d'authentification.`);
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
        console.log(`🎬 [AuthSlice] Action setLoading: Passage à ${action.payload}.`);
        state.isLoading = action.payload;
    }
  },
});

export const { setUser, logout, setLoading } = authSlice.actions;

export default authSlice.reducer;
