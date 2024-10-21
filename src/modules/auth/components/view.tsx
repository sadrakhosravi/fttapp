import { Outlet } from 'react-router-dom';

// Components
import { cn } from '@/lib/utils';
import { GridPattern } from '@/components/patterns/grid-pattern';
import { Card, CardContent } from '@/components/ui/card';

// Images
import LoginAbstractImage from '../../../assets/img/login-abstract.jpg';
import LogoWhite from '@/assets/svg/logo-white.svg';

export const metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.',
};

export default function AuthenticationPage() {
  return (
    <main className="container relative hidden h-full flex-col items-center justify-center overflow-clip md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <meta property="og:title" content={metadata.title} />

      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <img
          src={LoginAbstractImage}
          className="absolute inset-0 h-full w-full rounded-lg"
          alt="Authentication"
        />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <img src={LogoWhite} className="mr-2 h-10 w-10" alt="Logo" />
          Xyra - Spiral Flow
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Wherever the art of medicine is loved, there is also a love of humanity.&rdquo;
            </p>
            <footer className="text-sm">Hippocrates</footer>
          </blockquote>
        </div>
      </div>
      <div className="relative flex items-center justify-center lg:p-8">
        <GridPattern
          squares={[
            [4, 4],
            [5, 1],
            [8, 2],
            [5, 3],
            [5, 5],
            [10, 10],
            [12, 15],
            [15, 10],
            [10, 15],
            [15, 10],
            [10, 15],
            [15, 10],
          ]}
          className={cn(
            '[mask-image:radial-gradient(100vw_circle_at_center,white,transparent)]',
            'fixed inset-x-0 inset-y-[-30%] -right-1/2 -top-1/2 z-[-1] h-[200vh] skew-y-12 opacity-80',
          )}
        />
        <div className="min-h-full w-8/12 space-y-3">
          <Card className="flex w-full items-center justify-center">
            <CardContent className="w-max overflow-clip px-10 py-10">
              <Outlet />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
