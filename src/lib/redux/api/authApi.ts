// src/lib/redux/api/authApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setUser, logout as logoutAction } from '../slices/authSlice';
import type { AuthResponse } from '@/types';
import type {
  LoginSchema,
  RegisterSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  Verify2FASchema,
} from '@/types';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/auth/' }),
  endpoints: (builder) => ({
    login: builder.mutation<any, LoginSchema>({
      query: (credentials) => ({
        url: 'login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<AuthResponse, RegisterSchema>({
      query: (userInfo) => ({
        url: 'register',
        method: 'POST',
        body: userInfo,
      }),
    }),
    socialLogin: builder.mutation<AuthResponse, { idToken: string }>({
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
                console.error('Social login failed:', error);
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
            console.error('2FA verification failed:', error);
        }
      },
    }),
    getSession: builder.query<AuthResponse, void>({
      query: () => 'session',
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data && data.user) {
            dispatch(setUser(data.user));
          } else {
             dispatch(logoutAction());
          }
        } catch (error) {
          dispatch(logoutAction());
        }
      },
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: 'logout',
        method: 'POST',
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(logoutAction());
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
} = authApi;
