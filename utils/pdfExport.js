// utils/pdfExport.js - LANDSCAPE PDF with full page coverage
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportTableToPDF = async (tableElement, filename = 'prayer-times.pdf', monthName = '') => {
  try {
    if (!tableElement) {
      alert('Error: Cannot find table to export');
      return;
    }

    // Create canvas at high quality
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

    // Create PDF - LANDSCAPE A4
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    // A4 Landscape: 297mm x 210mm
    const pageWidth = 297;
    const pageHeight = 210;
    const margin = 2;

    // Calculate image dimensions to fit the page
    const availableWidth = pageWidth - (margin * 2);
    const availableHeight = pageHeight - (margin * 2);

    // Get canvas aspect ratio
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const aspectRatio = canvasWidth / canvasHeight;

    // Calculate final dimensions
    let finalWidth = availableWidth;
    let finalHeight = finalWidth / aspectRatio;

    // If height exceeds available, scale down
    if (finalHeight > availableHeight) {
      finalHeight = availableHeight;
      finalWidth = finalHeight * aspectRatio;
    }

    // Center on page
    const xPosition = (pageWidth - finalWidth) / 2;
    const yPosition = margin;

    // Add image to PDF
    pdf.addImage(imgData, 'PNG', xPosition, yPosition, finalWidth, finalHeight);

    // Handle multi-page if needed
    let heightRemaining = finalHeight - availableHeight;
    let currentPage = 1;

    while (heightRemaining > 0) {
      currentPage++;
      pdf.addPage([pageWidth, pageHeight], 'landscape');
      
      const position = -(currentPage - 1) * availableHeight;
      pdf.addImage(imgData, 'PNG', xPosition, position + yPosition, finalWidth, finalHeight);
      
      heightRemaining -= availableHeight;
    }

    // Save the PDF
    pdf.save(filename);
    
  } catch (error) {
    console.error('PDF Error:', error);
    alert('Error generating PDF');
  }
};
