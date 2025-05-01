'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { throatUnwrap$, paramStore$ } from '../store/store';
import { createPDF } from '../pdf/createPDF';
import { PageSize } from '../pdf/constants';
import { useState } from 'react';
import { toast } from 'sonner';

export const PrintFileButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePrintButtonClick = async () => {
    try {
      setIsLoading(true);
      const throatUnwrap = throatUnwrap$.get();
      const pageSize = paramStore$.size.get() as PageSize;

      if (!throatUnwrap) {
        toast.error('No throat unwrap data found.');
        setIsLoading(false);
        return;
      }

      const pdfBlob = createPDF(throatUnwrap.unwrappedCylinder, throatUnwrap.edges);

      if (!pdfBlob) {
        toast.error('Failed to create PDF.');
        setIsLoading(false);
        return;
      }

      // Create a URL for the PDF blob
      const url = URL.createObjectURL(pdfBlob);

      try {
        // Attempt to open in a new tab
        const printWindow = window.open(url, '_blank');

        // Better detection for popup blocking
        if (!printWindow || printWindow.closed || typeof printWindow.closed === 'undefined') {
          // Popup was likely blocked, offer download instead
          toast.warning('Pop-up blocked. Downloading the PDF file instead.');
          downloadPdf(pdfBlob);
        } else {
          toast.success('PDF opened in a new tab');

          // Cleanup when possible
          setTimeout(() => {
            URL.revokeObjectURL(url);
            setIsLoading(false);
          }, 100);
        }
      } catch (error) {
        console.error('Error opening print window:', error);
        toast.warning('Could not open PDF. Downloading the file instead.');
        downloadPdf(pdfBlob);
      }
    } catch (error) {
      console.error('Error in print process:', error);
      toast.error('An error occurred during printing.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to download the PDF file
  const downloadPdf = (blob: Blob) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'throat-unwrap.pdf';
    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }, 100);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="secondary"
        className="font-semibold"
        onClick={handlePrintButtonClick}
        disabled={isLoading}
      >
        <Printer className="mr-1" />
        Print
      </Button>
    </div>
  );
};
