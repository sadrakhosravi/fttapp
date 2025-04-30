// Components
import { Header } from '@/modules/header/header';
import { Preview } from '@/modules/preview/components/preview';
import { ParameterControls } from '@/modules/controls/components/parameter-controls';
import { PageControls } from '@/modules/controls/components/page-controls';
import { Suspense } from 'react';

export default function Home() {
  return (
    <div className="mx-auto flex h-full min-h-screen min-w-screen flex-col gap-4 overflow-x-clip p-2 px-4 pb-0">
      <Header />
      <main className="flex h-full w-full items-center gap-8">
        <div className="h-full pt-2">
          <ParameterControls />
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <Preview />
        </Suspense>
        <div className="h-full pt-2">
          <PageControls />
        </div>
      </main>
    </div>
  );
}
