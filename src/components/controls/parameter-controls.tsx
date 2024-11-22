'use client';

import * as React from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Link from 'next/link';

// Components
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';

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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <h3 className="mb-4 font-semibold">Cylinder Size</h3>
          <div className="w-full space-y-3 pl-6">
            <FormField
              control={form.control}
              name="r1"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-4">
                    <FormLabel className="flex items-center gap-1">
                      Radius 1
                      <Badge
                        className="text-xs font-light text-muted-foreground"
                        variant="secondary"
                      >
                        cm
                      </Badge>
                    </FormLabel>
                    <div className="w-1/2">
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
                    <FormLabel className="flex items-center gap-1">
                      Radius 2
                      <Badge
                        className="text-xs font-light text-muted-foreground"
                        variant="secondary"
                      >
                        cm
                      </Badge>
                    </FormLabel>{' '}
                    <div className="w-1/2">
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
                    <FormLabel className="flex items-center gap-1">
                      Height
                      <Badge
                        className="text-xs font-light text-muted-foreground"
                        variant="secondary"
                      >
                        cm
                      </Badge>
                    </FormLabel>
                    <div className="w-1/2">
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
          <h3 className="mb-4 font-semibold">Cylinder Options</h3>

          <div className="space-y-3 pl-6">
            <FormField
              control={form.control}
              name="cut_angle"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-4">
                    <FormLabel className="flex items-center gap-1">
                      Cut Angel
                      <Badge
                        className="text-xs font-light text-muted-foreground"
                        variant="secondary"
                      >
                        deg
                      </Badge>
                    </FormLabel>
                    <div className="w-1/2">
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
                    <div className="w-1/2">
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
              render={({}) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-4">
                    <FormLabel>Equidistant</FormLabel>
                    <div className="w-1/2">
                      <FormControl className="w-full">
                        <ToggleGroup className="w-full" type="single" defaultValue="a">
                          <ToggleGroupItem value="a">Yes</ToggleGroupItem>
                          <ToggleGroupItem value="b">No</ToggleGroupItem>
                        </ToggleGroup>

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

      <div className="fixed bottom-4 left-4 w-full text-xs font-light text-muted-foreground">
        Designed and Developed by{' '}
        <Link
          className="border-b border-blue-500 text-blue-500"
          rel="_blank"
          href="https://sadrakhosravi.com"
        >
          Sadra Khosravi
        </Link>
      </div>
    </aside>
  );
};
