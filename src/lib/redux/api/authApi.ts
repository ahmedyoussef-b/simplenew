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
      query: (credentials) => {
        console.log('🔑 [RTK Query] Déclenchement de la mutation login...');
        return {
            url: 'login',
            method: 'POST',
            body: credentials,
        };
      },
    }),
    register: builder.mutation<AuthResponse, RegisterSchema>({
      query: (userInfo) => {
        console.log('🌱 [RTK Query] Déclenchement de la mutation register...');
        return {
            url: 'register',
            method: 'POST',
            body: userInfo,
        };
      },
    }),
    socialLogin: builder.mutation<AuthResponse, { idToken: string }>({
        query: ({ idToken }) => {
            console.log('🌐 [RTK Query] Déclenchement de la mutation socialLogin...');
            return {
                url: 'social-login',
                method: 'POST',
                body: { idToken },
            };
        },
        async onQueryStarted(args, { dispatch, queryFulfilled }) {
            console.log('🌐 [RTK Query] socialLogin a démarré.');
            try {
                const { data } = await queryFulfilled;
                console.log('✅ [RTK Query] socialLogin réussi, mise à jour de l\'utilisateur.');
                dispatch(setUser(data.user));
            } catch (error) {
                console.error('❌ [RTK Query] Échec de socialLogin:', error);
            }
        },
    }),
    forgotPassword: builder.mutation<void, ForgotPasswordSchema>({
      query: (email) => {
        console.log('🔑 [RTK Query] Déclenchement de la mutation forgotPassword...');
        return {
          url: 'forgot-password',
          method: 'POST',
          body: email,
        };
      },
    }),
    resetPassword: builder.mutation<void, ResetPasswordSchema & { token: string }>({
      query: ({ token, ...body }) => {
        console.log('🔄 [RTK Query] Déclenchement de la mutation resetPassword...');
        return {
          url: 'reset-password',
          method: 'POST',
          body: { ...body, token },
        };
      },
    }),
    verify2fa: builder.mutation<AuthResponse, Verify2FASchema & { tempToken: string }>({
      query: (data) => {
        console.log('🔐 [RTK Query] Déclenchement de la mutation verify2fa...');
        return {
            url: 'verify-2fa',
            method: 'POST',
            body: data,
        };
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        console.log('🔐 [RTK Query] verify2fa a démarré.');
        try {
            const { data } = await queryFulfilled;
            console.log('✅ [RTK Query] verify2fa réussi, mise à jour de l\'utilisateur.');
            dispatch(setUser(data.user));
        } catch (error) {
            console.error('❌ [RTK Query] Échec de verify2fa:', error);
        }
      },
    }),
    getSession: builder.query<AuthResponse, void>({
      query: () => {
        console.log('🔎 [RTK Query] Déclenchement de la query getSession...');
        return 'session';
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        console.log('🔎 [RTK Query] getSession a démarré.');
        try {
          const { data } = await queryFulfilled;
          if (data && data.user) {
            console.log('✅ [RTK Query] Session récupérée, mise à jour de l\'utilisateur:', data.user.email);
            dispatch(setUser(data.user));
          } else {
             console.log('🚫 [RTK Query] Aucune session, déconnexion.');
             dispatch(logoutAction());
          }
        } catch (error) {
          console.error('❌ [RTK Query] Échec de getSession, déconnexion.', error);
          dispatch(logoutAction());
        }
      },
    }),
    logout: builder.mutation<void, void>({
      query: () => {
        console.log('👋 [RTK Query] Déclenchement de la mutation logout...');
        return {
            url: 'logout',
            method: 'POST',
        };
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        console.log('👋 [RTK Query] logout a démarré.');
        await queryFulfilled;
        console.log('✅ [RTK Query] Déconnexion réussie, nettoyage de l\'état.');
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
