import * as React from 'react';
import Image from 'next/image';

// Logo
import Logo from '../../../public/spiralflow-logo-white.svg';

import { ExportFileButton } from './export-file-button';
import { PrintFileButton } from './print-file-button';
import { ShareButton } from './share-button';

export const Header = () => {
  return (
    <header className="flex h-11 w-full shrink-0 items-center gap-2">
      <div className="flex h-full w-1/2 items-center gap-2">
        <div className="flex items-center justify-center rounded-md bg-blue-500 p-1">
          <Image src={Logo} alt="Spiral Flow" width={24} height={24} />
        </div>
        <span className="text-base font-bold">Spiral Flow</span>
      </div>
      <div className="flex h-full w-1/2 items-center justify-end gap-1.5">
        <ShareButton />
        <ExportFileButton />
        <PrintFileButton />
      </div>
    </header>
  );
};
