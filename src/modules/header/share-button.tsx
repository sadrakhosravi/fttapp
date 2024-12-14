'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Share2 } from 'lucide-react';

export const ShareButton = () => {
  const handleShareButtonClick = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          text: 'Check out this page:',
          url: window.location.href,
        });
        console.log('Successfully shared');
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      console.warn('Web Share API not supported in this browser.');
      // Fallback: could copy link to clipboard or show a modal informing the user
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button className="font-semibold" onClick={handleShareButtonClick} variant={'secondary'}>
            <Share2 />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Share these parameters</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
