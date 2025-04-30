'use client';

import { z } from 'zod';
import { observable } from '@legendapp/state';

import type { pageControlsSchema } from '../controls/schemas/page-controls-schema';
import type { cir_res_map, parameterFormSchema } from '../controls/schemas/parameter-schema';
import type { ThroatUnwrap } from '@/algorithm/ThroatUnwrap';
import { cutAngleOptions } from '../controls/data/control-options';

type Store = z.infer<typeof pageControlsSchema> & z.infer<typeof parameterFormSchema> & {};

export const paramStore$ = observable<Store>({
  r1: 8,
  r2: 9,
  h: 7,
  cir_res: 'medium',
  cut_angle: parseInt(cutAngleOptions[0].value),
  equidistant: 'no',
  size: 'A4',
  orientation: 'Portrait',
  exportType: 'PDF',
});

export const throatUnwrap$ = observable<ThroatUnwrap | null>(null);

// Wrap window-dependent code in a client-only check
if (typeof window !== 'undefined') {
  const searchParams = new URLSearchParams(window.location.search);

  searchParams.forEach((value, key) => {
    if (paramStore$.hasOwnProperty(key)) {
      const parsedValue = parseValue(value, paramStore$[key as keyof typeof paramStore$]);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      paramStore$[key as keyof typeof paramStore$].set(parsedValue);
    }
  });

  if (searchParams.has('cir_res'))
    paramStore$.cir_res.set(searchParams.get('cir_res') as keyof typeof cir_res_map);

  // Initialize URL query parameters based on the store
  setQueryParams();

  // Update URL query parameters on store changes
  paramStore$.onChange((store) => {
    const params = new URLSearchParams(window.location.search);
    Object.entries(store.value).forEach(([key, value]) => {
      params.set(key, value?.toString());
    });
    window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
  });
}

/**
 * Helper function to parse values based on the existing type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseValue(value: string, currentValue: any) {
  if (typeof currentValue === 'number') return parseFloat(value);
  if (typeof currentValue === 'boolean') return value === 'true';
  return value;
}

/**
 * Helper function that sets the URL query params based on the store
 */
export function setQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const store = paramStore$.get();
  Object.entries(store).forEach(([key, value]) => {
    params.set(key, value?.toString());
  });
  window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
}
