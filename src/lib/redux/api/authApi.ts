// src/lib/redux/api/authApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setUser, logout as logoutAction } from '../slices/authSlice';
import type { SafeUser, Role } from '@/types/index';
import type { 
    LoginSchema, 
    RegisterSchema, 
    ForgotPasswordSchema, 
    ResetPasswordSchema, 
    Verify2FASchema,
    ProfileUpdateSchema
} from '@/types/schemas';

// --- Response Types ---

export interface AuthResponse {
  message?: string; // Optional message for some responses
  user: SafeUser;
}

export interface TwoFactorResponse {
    twoFactorRequired: boolean;
    tempToken: string;
    twoFactorCode?: string; // For prototyping, should not be in production
}

export type LoginResponse = AuthResponse | TwoFactorResponse;

export interface LogoutResponse {
    message: string;
}

export interface SessionResponse {
  user: SafeUser | null; 
}


// --- Request Types ---

export interface SocialLoginRequest {
  idToken: string;
}


// --- API Definition ---

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/auth/' }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginSchema>({
      query: (credentials) => ({
        url: 'login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        console.log("▶️ [authApi] onQueryStarted for login mutation.");
        try {
            const { data } = await queryFulfilled;
            console.log("✅ [authApi] Login queryFulfilled. Data:", data);
            if ('user' in data) { // Check if it's AuthResponse
                dispatch(setUser(data.user));
            }
            // If it's TwoFactorResponse, we wait for the 2FA verification step
        } catch (error) {
            console.error("❌ [authApi] Login queryFulfilled failed.", error);
        }
      },
    }),
    register: builder.mutation<AuthResponse, RegisterSchema>({
      query: (userInfo) => ({
        url: 'register',
        method: 'POST',
        body: userInfo,
      }),
    }),
    socialLogin: builder.mutation<AuthResponse, SocialLoginRequest>({
        query: ({ idToken }) => ({
            url: 'social-login',
            method: 'POST',
            body: { idToken },
        }),
        async onQueryStarted(args, { dispatch, queryFulfilled }) {
            try {
                const { data } = await queryFulfilled;
                dispatch(setUser(data.user));
            } catch (error) {
                // Handle error
            }
        },
    }),
    forgotPassword: builder.mutation<void, ForgotPasswordSchema>({
      query: (email) => ({
        url: 'forgot-password',
        method: 'POST',
        body: email,
      }),
    }),
    resetPassword: builder.mutation<void, ResetPasswordSchema & { token: string }>({
      query: ({ token, ...body }) => ({
        url: 'reset-password',
        method: 'POST',
        body: { ...body, token },
      }),
    }),
    verify2fa: builder.mutation<AuthResponse, Verify2FASchema & { tempToken: string }>({
      query: (data) => ({
        url: 'verify-2fa',
        method: 'POST',
        body: data,
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
            const { data } = await queryFulfilled;
            dispatch(setUser(data.user));
        } catch (error) {
            // Handle error
        }
      },
    }),
    getSession: builder.query<SessionResponse, void>({
      query: () => 'session',
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        console.log("▶️ [authApi] onQueryStarted for getSession query.");
        try {
          const { data } = await queryFulfilled;
          console.log("✅ [authApi] getSession queryFulfilled. Data:", data);
          if (data?.user) {
            dispatch(setUser(data.user));
          } else {
             dispatch(logoutAction());
          }
        } catch (error) {
          console.error("❌ [authApi] getSession queryFulfilled failed.", error);
          dispatch(logoutAction());
        }
      },
    }),
    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: 'logout',
        method: 'POST',
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(logoutAction());
      },
    }),
    updateProfile: builder.mutation<AuthResponse, Partial<ProfileUpdateSchema>>({
      query: (body) => ({
        url: '/api/profile', // Note: This endpoint is outside the /api/auth base
        method: 'PUT',
        body,
      }),
       async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data.user));
        } catch (error) {
          // Handle error if profile update fails
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useSocialLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerify2faMutation,
  useGetSessionQuery,
  useLogoutMutation,
  useUpdateProfileMutation,
} = authApi;
