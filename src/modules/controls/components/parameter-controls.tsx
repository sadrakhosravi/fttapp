'use client';

import * as React from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Link from 'next/link';

// Components
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

// Store
import { paramStore$, setQueryParams } from '@/modules/store/store';

// Schemas
import { parameterFormSchema } from '../schemas/parameter-schema';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { observer } from '@legendapp/state/react';
import { cutAngleOptions } from '../data/control-options';

export const ParameterControls = observer(() => {
  const form = useForm<z.infer<typeof parameterFormSchema>>({
    resolver: zodResolver(parameterFormSchema),
    values: {
      r1: paramStore$.r1.get(),
      r2: paramStore$.r2.get(),
      h: paramStore$.h.get(),
      cir_res: paramStore$.cir_res.get(),
      cut_angle: paramStore$.cut_angle.get(),
      equidistant: paramStore$.equidistant.get(),
    },
  });

  // Update store on form change
  React.useEffect(() => {
    const subscription = form.watch((values) => {
      paramStore$.set({
        ...paramStore$.get(),
        r1: values.r1!,
        r2: values.r2!,
        h: values.h!,
        cir_res: values.cir_res!,
        cut_angle: values.cut_angle!,
        equidistant: values.equidistant!,
      });
    });

    setTimeout(() => {
      setQueryParams();
    }, 100);

    return () => subscription.unsubscribe();
  }, []);

  return (
    <aside className="h-full w-[24rem] flex-shrink-0">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(() => {})} className="w-full">
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
                        className="text-muted-foreground text-xs font-light"
                        variant="secondary"
                      >
                        cm
                      </Badge>
                    </FormLabel>
                    <div className="w-1/2">
                      <FormControl className="w-full">
                        <Input type="number" min={1} max={20} className="w-full" {...field} />
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
                        className="text-muted-foreground text-xs font-light"
                        variant="secondary"
                      >
                        cm
                      </Badge>
                    </FormLabel>{' '}
                    <div className="w-1/2">
                      <FormControl className="w-full">
                        <Input type="number" min={1} max={20} className="w-full" {...field} />
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
                        className="text-muted-foreground text-xs font-light"
                        variant="secondary"
                      >
                        cm
                      </Badge>
                    </FormLabel>
                    <div className="w-1/2">
                      <FormControl className="w-full">
                        <Input type="number" min={1} max={20} className="w-full" {...field} />
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
                    <FormLabel>Cut Angle</FormLabel>
                    <div className="w-1/2">
                      <FormControl className="w-full">
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value.toString()}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {cutAngleOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
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
              name="cir_res"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-4">
                    <FormLabel>Circle Resolution</FormLabel>
                    <div className="w-1/2">
                      <FormControl className="w-full">
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value.toString()}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
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
              name="equidistant"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-4">
                    <FormLabel>Equidistant</FormLabel>
                    <div className="w-1/2">
                      <FormControl className="w-full">
                        <ToggleGroup
                          className="w-full"
                          type="single"
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                        >
                          <ToggleGroupItem value="yes">Yes</ToggleGroupItem>
                          <ToggleGroupItem value="no">No</ToggleGroupItem>
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

      <div className="text-muted-foreground fixed bottom-4 left-4 w-full text-xs font-light">
        Designed and Developed by{' '}
        <Link
          target="_blank"
          className="border-b border-blue-500 text-blue-500"
          rel="_blank"
          href="https://sadrakhosravi.com"
        >
          Sadra Khosravi
        </Link>
      </div>
    </aside>
  );
});
