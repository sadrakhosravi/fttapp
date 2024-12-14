'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { throatUnwrap$ } from '../store/store';
import { createPDF } from '../pdf/createPDF';

export const PrintFileButton = () => {
  const handlePrintButtonClick = async () => {
    const throatUnwrap = throatUnwrap$.get();

    if (!throatUnwrap) {
      console.warn('No throat unwrap data found.');
      return;
    }

    // Generate the PDF blob
    const pdfBlob = createPDF(throatUnwrap.unwrappedCylinder, throatUnwrap.edges);

    if (!pdfBlob) {
      console.error('Failed to create PDF blob.');
      return;
    }

    // Create a URL for the PDF blob
    const pdfUrl = URL.createObjectURL(pdfBlob);

    // Open the PDF in a new window/tab
    const newWindow = window.open(pdfUrl);

    if (!newWindow) {
      console.error('Failed to open new window. Possibly blocked by the browser.');
      return;
    }

    // Once the new window loads, focus and print
    newWindow.addEventListener('load', () => {
      newWindow.focus();
      // Trigger print dialog
      newWindow.print();
    });
  };

  return (
    <Button className="font-semibold" onClick={handlePrintButtonClick} variant={'secondary'}>
      <Printer />
      Print File
    </Button>
  );
};
