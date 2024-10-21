import * as React from 'react';
import { LucideCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

// Components
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// Custom Icons
import AppleIcon from '@/assets/svg/apple.svg';
import FacebookIcon from '@/assets/svg/facebook.svg';
import GoogleIcon from '@/assets/svg/google.svg';

// Types and Schema
import { SignUpSchema, signUpSchema } from '../schema/auth.schema';
import { Link } from 'react-router-dom';
import { AppRoutes } from '@/router/routes';

type SignUpFormProps = React.HTMLAttributes<HTMLDivElement>;

export const SignUpForm = ({ className }: SignUpFormProps) => {
  const [isLoading] = React.useState<boolean>(false);

  // 1. Define your form.
  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  // 2. Define a submit handler.
  const onSubmit = async (values: SignUpSchema) => {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  };

  return (
    <motion.div
      className={cn('grid gap-6', className)}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.7, delay: 0.2 }}
    >
      <div className="flex w-full flex-col justify-center space-y-3 sm:w-[350px]">
        <div className="flex flex-col space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">
            Enter your information to create an account.
          </p>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your name..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email..." type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    autoComplete="new-password"
                    placeholder="Enter your password..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-2">
            <Button disabled={isLoading} className="w-full">
              {isLoading && <LucideCircle className="mr-2 h-4 w-4 animate-spin" />}
              Sign Up
            </Button>
          </div>
        </form>
      </Form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" type="button" disabled={isLoading} className="w-1/3">
          <img src={GoogleIcon} className="h-5 w-5" alt="Google" />
          Google
        </Button>
        <Button variant="outline" type="button" disabled={isLoading} className="w-1/3">
          <img src={FacebookIcon} className="h-5 w-5" alt="Facebook" />
          Facebook
        </Button>
        <Button variant="outline" type="button" disabled={isLoading} className="w-1/3">
          <img src={AppleIcon} className="h-5 w-5" alt="Apple" />
          Apple
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        By clicking sign up, you agree to our{' '}
        <Link to="/terms" className="underline underline-offset-4 hover:text-primary">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link to="/privacy" className="underline underline-offset-4 hover:text-primary">
          Privacy Policy
        </Link>
        .
      </p>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
      </div>
      <Link
        to={AppRoutes.AUTH.LOGIN}
        className={cn(
          buttonVariants({ variant: 'link' }),
          'w-full text-center underline underline-offset-4',
        )}
      >
        Already have an account? Sign in
      </Link>
    </motion.div>
  );
};
