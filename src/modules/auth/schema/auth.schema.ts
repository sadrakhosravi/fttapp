import { z } from 'zod';

// Define the schema for the sign up form
export const signUpSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
});

export type SignUpSchema = z.infer<typeof signUpSchema>;

// Define the schema for the sign in form
export const signInSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
});

export type SignInSchema = z.infer<typeof signInSchema>;
