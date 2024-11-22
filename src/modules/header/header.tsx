import * as React from 'react';
import Image from 'next/image';

// Logo
import Logo from '../../../public/spiralflow-logo-white.svg';
import { Button } from '../../components/ui/button';
import { Download, Printer, Share2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip';

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
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="secondary" className="mr-1.5" size="icon">
                <Share2 />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Share these parameters</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button className="font-semibold">
          <Download />
          Export File
        </Button>
        <Button className="font-semibold" variant="secondary">
          <Printer />
          Print
        </Button>
      </div>
    </header>
  );
};
