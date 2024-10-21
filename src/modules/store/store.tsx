import { createClient } from '@supabase/supabase-js';
import { QueryClient } from 'react-query';
import { observable } from '@legendapp/state';

// Create a single instance of supabase client for interacting with your database
export const supabase = createClient(
  import.meta.env['VITE_SUPABASE_URL'],
  import.meta.env['VITE_SUPABASE_ANON_KEY'],
);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: 3,
      staleTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

// Global store
export const store$ = observable({
  auth: {
    token: '',
    user: null,
  },
});
