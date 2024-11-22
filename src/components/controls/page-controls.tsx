'use client';

import * as React from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

// Components
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Separator } from '../ui/separator';

// Schemas
import { pageControlsSchema } from './page-controls/page-controls-schema';

export const PageControls = () => {
  const form = useForm<z.infer<typeof pageControlsSchema>>({
    resolver: zodResolver(pageControlsSchema),
    defaultValues: {
      size: 'A4',
      orientation: 'Portrait',
      margins: 'Normal',
    },
  });

  function onSubmit(values: z.infer<typeof pageControlsSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  return (
    <aside className="h-full w-80 flex-shrink-0">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <h3 className="mb-4 font-semibold">Page Options</h3>
          <div className="w-full space-y-3 pl-6">
            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-4">
                    <FormLabel className="flex items-center gap-1">Size</FormLabel>
                    <div className="w-1/2">
                      <FormControl className="w-full">
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder={field.value} />
                          </SelectTrigger>
                          <SelectContent>
                            {pageControlsSchema.shape.size.options.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="orientation"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-4">
                    <FormLabel className="flex items-center gap-1">Orientation</FormLabel>
                    <div className="w-1/2">
                      <FormControl className="w-full">
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder={field.value} />
                          </SelectTrigger>
                          <SelectContent>
                            {pageControlsSchema.shape.orientation.options.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="margins"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-4">
                    <FormLabel className="flex items-center gap-1">Margins</FormLabel>
                    <div className="w-1/2">
                      <FormControl className="w-full">
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder={field.value} />
                          </SelectTrigger>
                          <SelectContent>
                            {pageControlsSchema.shape.margins.options.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Separator className="my-6" />
          <h3 className="mb-4 font-semibold">Export Options</h3>
          <Separator className="my-6" />
          <h3 className="mb-4 font-semibold">Save Options</h3>
        </form>
      </Form>
    </aside>
  );
};
