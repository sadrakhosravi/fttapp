'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { throatUnwrap$ } from '../store/store';
import { createPDF } from '../pdf/createPDF';

export const ExportFileButton = () => {
  const handleExportButtonClick = async () => {
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

    // Check if the File System Access API is available
    if ('showSaveFilePicker' in window) {
      try {
        const options = {
          suggestedName: 'exported_file.pdf',
          types: [
            {
              description: 'PDF Files',
              accept: { 'application/pdf': ['.pdf'] },
            },
          ],
        };

        // Show save file picker dialog
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handle = await (window as any).showSaveFilePicker(options);
        const writable = await handle.createWritable();
        await writable.write(pdfBlob);
        await writable.close();
      } catch (error) {
        console.error('Error showing save file dialog:', error);
      }
    } else {
      // Fallback: use the anchor download method if File System Access API is not supported
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'exported_file.pdf'; // Fallback filename
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Button className="font-semibold" onClick={handleExportButtonClick}>
      <Download />
      Export File
    </Button>
  );
};
