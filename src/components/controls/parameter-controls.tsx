'use client';

import * as React from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

// Components
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';

// Schemas
import { parameterFormSchema } from './parameter-controls/parameter-schema';

export const ParameterControls = () => {
  const form = useForm<z.infer<typeof parameterFormSchema>>({
    resolver: zodResolver(parameterFormSchema),
    defaultValues: {
      r1: 0,
      r2: 0,
      h: 0,
      cir_res: 0,
      cut_angle: 0,
      equidistant: false,
    },
  });

  function onSubmit(values: z.infer<typeof parameterFormSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  return (
    <aside className="h-full w-80 flex-shrink-0">
      <h3 className="mb-4 font-semibold">Parameters</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <div className="w-full space-y-3 pl-6">
            <FormField
              control={form.control}
              name="r1"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-4">
                    <FormLabel>Radius 1</FormLabel>
                    <div className="w-2/3">
                      <FormControl className="w-full">
                        <Input className="w-full" placeholder="shadcn" {...field} />
                      </FormControl>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="r2"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-4">
                    <FormLabel>Radius 2</FormLabel>
                    <div className="w-2/3">
                      <FormControl className="w-full">
                        <Input className="w-full" placeholder="shadcn" {...field} />
                      </FormControl>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="h"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-4">
                    <FormLabel>Height</FormLabel>
                    <div className="w-2/3">
                      <FormControl className="w-full">
                        <Input className="w-full" placeholder="shadcn" {...field} />
                      </FormControl>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Separator className="my-6" />
          <div className="space-y-3 pl-6">
            <FormField
              control={form.control}
              name="cut_angle"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-4">
                    <FormLabel>Cut Angle</FormLabel>
                    <div className="w-2/3">
                      <FormControl className="w-full">
                        <Input className="w-full" placeholder="shadcn" {...field} />
                      </FormControl>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cir_res"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-4">
                    <FormLabel>Circle Res</FormLabel>
                    <div className="w-2/3">
                      <FormControl className="w-full">
                        <Input className="w-full" placeholder="shadcn" {...field} />
                      </FormControl>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="equidistant"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-4">
                    <FormLabel>Equidistant</FormLabel>
                    <div className="w-2/3">
                      <FormControl className="w-full">
                        {/* <Input className="w-full" placeholder="shadcn" {...field} /> */}
                      </FormControl>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </aside>
  );
};
