'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { throatUnwrap$, paramStore$ } from '../store/store';
import { createPDF } from '../pdf/createPDF';
import { PageSize } from '../pdf/constants';

export const ExportFileButton = () => {
  const handleExportButtonClick = async () => {
    const throatUnwrap = throatUnwrap$.get();
    const pageSize = paramStore$.size.get() as PageSize;
    const orientation = paramStore$.orientation.get();
    const isLandscape = orientation === 'Landscape';

    if (!throatUnwrap) {
      console.warn('No throat unwrap data found.');
      return;
    }

    // Generate the PDF blob with the selected page size and orientation
    const pdfBlob = createPDF(
      throatUnwrap.unwrappedCylinder,
      throatUnwrap.edges,
      { r: 0, g: 0, b: 0 }, // Default black color
      25.4 * 2, // Default padding
      0.5, // Default stroke thickness
      pageSize, // Use the selected page size from the store
      isLandscape, // Pass landscape flag
    );

    if (!pdfBlob) {
      console.error('Failed to create PDF blob.');
      return;
    }

    try {
      // Always use the fallback method which is more reliable across browsers
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'exported_file.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting file:', error);
    }
  };

  return (
    <Button className="font-semibold" onClick={handleExportButtonClick}>
      <Download />
      Export File
    </Button>
  );
};
