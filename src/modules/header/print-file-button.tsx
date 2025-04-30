'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { throatUnwrap$, paramStore$ } from '../store/store';
import { createPDF } from '../pdf/createPDF';
import { PageSize } from '../pdf/constants';

export const PrintFileButton = () => {
  const handlePrintButtonClick = async () => {
    const throatUnwrap = throatUnwrap$.get();
    const pageSize = paramStore$.size.get() as PageSize;

    if (!throatUnwrap) {
      console.warn('No throat unwrap data found.');
      return;
    }

    const pdfBlob = createPDF(throatUnwrap.unwrappedCylinder, throatUnwrap.edges);

    if (!pdfBlob) {
      console.error('Failed to create PDF blob.');
      return;
    }

    try {
      const url = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(url);

      if (!printWindow) {
        console.error('Failed to open print window. Check if pop-ups are blocked.');
        return;
      }

      printWindow.addEventListener('load', () => {
        printWindow.print();
        // Clean up the URL object after printing
        setTimeout(() => {
          printWindow.close();
          URL.revokeObjectURL(url);
        }, 100);
      });
    } catch (error) {
      console.error('Error opening print dialog:', error);
    }
  };

  return (
    <Button variant="secondary" className="font-semibold" onClick={handlePrintButtonClick}>
      <Printer />
      Print
    </Button>
  );
};
