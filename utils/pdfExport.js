// utils/pdfExport.js - FIXED
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportTableToPDF = async (
  tableElement,
  filename = 'prayer-times.pdf',
  monthName = ''
) => {
  try {
    if (!tableElement) {
      alert('Error: Cannot find table to export');
      return;
    }

    // Get ACTUAL scrollable dimensions
    const elementWidth = tableElement.scrollWidth;
    const elementHeight = tableElement.scrollHeight;

    console.log('Element dimensions:', { elementWidth, elementHeight });

    // CRITICAL: Don't constrain html2canvas - let it capture full content
    const canvas = await html2canvas(tableElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      // Remove width/height/windowWidth/windowHeight constraints
      // html2canvas will now capture the ACTUAL element dimensions
    });

    console.log('Canvas dimensions:', { 
      width: canvas.width, 
      height: canvas.height 
    });

    // Use PORTRAIT orientation
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: false,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();   // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight();  // 297mm

    const imgData = canvas.toDataURL('image/jpeg', 1.0);

    const imgPixelWidth = canvas.width;
    const imgPixelHeight = canvas.height;

    // ---- SCALING WITH MARGINS ----
    const marginH = 5;  // horizontal margin
    const marginV = 5;  // vertical margin

    const maxWidth = pdfWidth - marginH * 2;
    const maxHeight = pdfHeight - marginV * 2;

    // Calculate scaling to fit content
    const widthRatio = maxWidth / imgPixelWidth;
    const heightRatio = maxHeight / imgPixelHeight;

    // Use WIDTH ratio for consistent scaling (maintains aspect)
    const ratio = widthRatio;

    const finalWidth = imgPixelWidth * ratio;
    const finalHeight = imgPixelHeight * ratio;

    console.log('Final dimensions:', { finalWidth, finalHeight, ratio });

    // Center horizontally, start at top margin
    const xOffset = (pdfWidth - finalWidth) / 2;
    const yOffset = marginV;

    // ---- MULTI-PAGE LOGIC ----
    // Check if content exceeds one page
    if (finalHeight > maxHeight) {
      // Content spans multiple pages
      let currentY = yOffset;
      let pageIndex = 0;
      let remainingHeight = finalHeight;

      while (remainingHeight > 0) {
        if (pageIndex > 0) {
          pdf.addPage('a4', 'portrait');
        }

        // Calculate source rect for this page (from canvas)
        const sourceTop = (pageIndex * maxHeight) / ratio;
        const sourceHeight = (maxHeight) / ratio;

        // Add image with clipping for this page
        pdf.addImage(
          imgData,
          'JPEG',
          xOffset,
          yOffset,
          finalWidth,
          finalHeight,
          undefined,
          undefined,
          undefined,
          sourceTop,
          sourceHeight
        );

        remainingHeight -= maxHeight;
        pageIndex++;
      }
    } else {
      // Fits on single page
      pdf.addImage(imgData, 'JPEG', xOffset, yOffset, finalWidth, finalHeight);
    }

    pdf.save(filename);
  } catch (error) {
    console.error('PDF Error:', error);
    alert('Error generating PDF: ' + error.message);
  }
};