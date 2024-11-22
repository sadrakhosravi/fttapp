// Components
import { Header } from '@/modules/header/header';
import { Preview } from '@/modules/preview/components/preview';
import { ParameterControls } from '@/modules/controls/components/parameter-controls';
import { PageControls } from '@/modules/controls/components/page-controls';

export default function Home() {
  return (
    <div className="min-w-screen mx-auto flex h-full min-h-screen flex-col gap-4 p-2 px-4 pb-0">
      <Header />
      <main className="flex h-full w-full items-center gap-8">
        <div className="h-full pt-2">
          <ParameterControls />
        </div>
        <Preview />
        <div className="h-full pt-2">
          <PageControls />
        </div>
      </main>
    </div>
  );
}
