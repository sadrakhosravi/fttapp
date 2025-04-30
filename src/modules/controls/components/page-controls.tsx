'use client';

import * as React from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { observer } from '@legendapp/state/react';

// Store
import { paramStore$ } from '@/modules/store/store';

// Components
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

// Schemas
import { pageControlsSchema } from '../schemas/page-controls-schema';
import { PageSize } from '@/modules/pdf/constants';

// Page size display names
const PAGE_SIZE_LABELS: Record<PageSize, string> = {
  [PageSize.A4]: 'A4',
  [PageSize.A3]: 'A3',
  [PageSize.LETTER]: 'Letter',
  [PageSize.LEGAL]: 'Legal',
};

export const PageControls = observer(() => {
  const form = useForm<z.infer<typeof pageControlsSchema>>({
    resolver: zodResolver(pageControlsSchema),
    defaultValues: {
      size: paramStore$.size.get(),
      orientation: paramStore$.orientation.get(),
      exportType: 'PDF',
      // margins: paramStore$.margins.get(),
    },
  });

  // Update store on form change
  React.useEffect(() => {
    const subscription = form.watch((values) => {
      paramStore$.size.set(values.size!);
      paramStore$.orientation.set(values.orientation!);
      // paramStore$.margins.set(values.margins!);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <aside className="h-full w-[24rem] flex-shrink-0">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(() => {})} className="w-full">
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={PAGE_SIZE_LABELS[field.value as PageSize] || field.value}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {pageControlsSchema.shape.size.options.map((option) => (
                              <SelectItem key={option} value={option}>
                                {PAGE_SIZE_LABELS[option as PageSize] || option}
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            {/* <FormField
              control={form.control}
              name="margins"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-4">
                    <FormLabel className="flex items-center gap-1">Margins</FormLabel>
                    <div className="w-1/2">
                      <FormControl className="w-full">
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            /> */}
          </div>
          <Separator className="my-6" />
          <h3 className="mb-4 font-semibold">Export Options</h3>
          <div className="w-full space-y-3 pl-6">
            <FormField
              control={form.control}
              name="exportType"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-4">
                    <FormLabel className="flex items-center gap-1">Export Type</FormLabel>
                    <div className="w-1/2">
                      <FormControl className="w-full">
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder={field.value} />
                          </SelectTrigger>
                          <SelectContent>
                            {pageControlsSchema.shape.exportType.options.map((option) => (
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
          {/* <Separator className="my-6" />
          <h3 className="mb-4 font-semibold">Save Options</h3> */}
        </form>
      </Form>
    </aside>
  );
});
