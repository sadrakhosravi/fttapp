'use client';
import React from 'react';
import { useSearchParams } from 'next/navigation';

// Components
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShapeViewer } from './pdf-viewer';

// Algorithm
import { ThroatUnwrap } from '@/algorithm/ThroatUnwrap';
import { ErrorBoundary } from './error-boundary';
import { toast } from 'sonner';
import { cir_res_map } from '@/modules/controls/schemas/parameter-schema';
import { throatUnwrap$ } from '@/modules/store/store';

export const Preview = () => {
  const searchParams = useSearchParams();
  const [throatUnwrap, setThroatUnwrap] = React.useState<null | ThroatUnwrap>();

  const par_r1 = searchParams.get('r1');
  const par_r2 = searchParams.get('r2');
  const par_h = searchParams.get('h');
  const par_cir_res = searchParams.get('cir_res');
  const par_cut_angle = searchParams.get('cut_angle');
  const par_equidistant = searchParams.get('equidistant');

  React.useEffect(() => {
    if (!par_r1 || !par_r2 || !par_h || !par_cir_res || !par_cut_angle || !par_equidistant) return;

    const r1 = parseFloat(par_r1);
    const r2 = parseFloat(par_r2);
    const h = parseFloat(par_h);
    const cir_res = cir_res_map[par_cir_res as keyof typeof cir_res_map];
    const cut_angle = parseFloat(par_cut_angle);
    const equidistant = par_equidistant === 'yes';

    if (r1 <= 0 || r2 <= 0 || h <= 1 || cir_res <= 1 || cut_angle <= 1) {
      setThroatUnwrap(null);
      return;
    }

    try {
      setThroatUnwrap(null);
      const unwrap = new ThroatUnwrap(r1, r2, h, cut_angle, cir_res, equidistant);
      setTimeout(() => {
        setThroatUnwrap(unwrap);
        throatUnwrap$.set(unwrap);
      }, 5);
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(`Error: ${e.message}`, {
          position: 'top-center',
        });
      } else {
        toast.error('An unknown error occurred', {
          position: 'top-center',
        });
      }
    }
  }, [par_r1, par_r2, par_h, par_cir_res, par_cut_angle, par_equidistant]);

  return (
    <ErrorBoundary>
      <Card className="flex h-full w-full flex-col rounded-2xl rounded-b-none border-input/80">
        <CardContent className="h-full p-4 pt-4">
          <Tabs defaultValue="page" className="h-full w-full overflow-hidden">
            <TabsList>
              <TabsTrigger className="font-semibold" value="page">
                2D View
              </TabsTrigger>
            </TabsList>
            <TabsContent className="flex h-full items-start justify-center p-2" value="page">
              {throatUnwrap && (
                <ShapeViewer
                  Vuv={throatUnwrap.unwrappedCylinder}
                  edges={throatUnwrap.edges}
                  padding={25.4}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
};
