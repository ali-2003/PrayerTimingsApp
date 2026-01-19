// utils/pdfExport.js - CENTERED PDF with full page coverage
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportTableToPDF = async (tableElement, filename = 'prayer-times.pdf', monthName = '') => {
  try {
    if (!tableElement) {
      alert('Error: Cannot find table to export');
      return;
    }

    // Create canvas
    const canvas = await html2canvas(tableElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowHeight: tableElement.scrollHeight,
      windowWidth: tableElement.scrollWidth,
    });

    const imgData = canvas.toDataURL('image/png');

    // Create PDF - PORTRAIT A4 (fills better for tables)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    // A4 Portrait: 210mm x 297mm
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 0;  // Small margin

    // Calculate image dimensions
    const availableWidth = pageWidth - (margin * 2);
    const availableHeight = pageHeight - (margin * 2);

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const aspectRatio = canvasWidth / canvasHeight;

    // SCALE TO FIT - expand to fill entire available space
    let finalWidth = availableWidth;
    let finalHeight = availableWidth / aspectRatio;

    // If content is shorter than page height, stretch it to fill
    if (finalHeight < availableHeight) {
      finalHeight = availableHeight;
      finalWidth = availableHeight * aspectRatio;
    }

    // CENTER the image on the page
    const xPosition = (pageWidth - finalWidth) / 2;
    const yPosition = (pageHeight - finalHeight) / 2;

    // Add image CENTERED on page
    pdf.addImage(imgData, 'PNG', xPosition, yPosition, finalWidth, finalHeight);

    // Handle multi-page if needed
    let heightRemaining = finalHeight - availableHeight;
    let currentPage = 1;

    while (heightRemaining > 0.5) {
      currentPage++;
      pdf.addPage([pageWidth, pageHeight], 'portrait');

      // Center on subsequent pages too
      const imgYPos = yPosition - ((currentPage - 1) * availableHeight);
      pdf.addImage(imgData, 'PNG', xPosition, imgYPos, finalWidth, finalHeight);

      heightRemaining -= availableHeight;
    }

    // Save the PDF
    pdf.save(filename);
  } catch (error) {
    console.error('PDF Error:', error);
    alert('Error generating PDF');
  }
};
