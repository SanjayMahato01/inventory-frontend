import { api } from '../api/apiSlice';
import { setUser, clearUser } from '../slices/authSlice';
export interface User {
  id: string;
  email: string;
  name: string | null;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput extends LoginInput {
  name?: string;
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<{ user: User }, LoginInput>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
    signup: builder.mutation<{ user: User }, SignupInput>({
      query: (body) => ({ url: '/auth/signup', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      invalidatesTags: ['User'],
    }),
   me: builder.query<{ user: User }, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data.user));   // ← global state set here
        } catch {
          dispatch(clearUser());
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useLogoutMutation,
  useMeQuery,
} = authApi;