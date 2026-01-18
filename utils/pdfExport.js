// utils/pdfExport.js - FIXED: No cutoff, proper scaling, full coverage
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportTableToPDF = async (tableElement, filename = 'prayer-times.pdf', monthName = '') => {
  try {
    if (!tableElement) {
      alert('Error: Cannot find table to export');
      return;
    }

    // Create canvas at lower scale to fit entire table
    const canvas = await html2canvas(tableElement, {
      scale: 1.2,  // Lower scale so entire content fits
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowHeight: tableElement.scrollHeight,
      windowWidth: tableElement.scrollWidth,
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');

    // Create PDF - LANDSCAPE A4
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: false
    });

    // A4 Landscape: 297mm x 210mm
    const pageWidth = 297;
    const pageHeight = 210;
    const margin = 1;  // Minimal margin

    // Calculate image dimensions to fit the page
    const availableWidth = pageWidth - (margin * 2);
    const availableHeight = pageHeight - (margin * 2);

    // Get canvas aspect ratio
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const aspectRatio = canvasWidth / canvasHeight;

    // Calculate final dimensions - fit to width first
    let finalWidth = availableWidth;
    let finalHeight = finalWidth / aspectRatio;

    // If height exceeds available, scale down
    if (finalHeight > availableHeight) {
      finalHeight = availableHeight;
      finalWidth = finalHeight * aspectRatio;
    }

    // Position to start from left margin (NOT centered)
    const xPosition = margin;
    const yPosition = margin;

    // Add image to PDF - no centering, starts from left
    pdf.addImage(imgData, 'PNG', xPosition, yPosition, finalWidth, finalHeight);

    // Handle multi-page if needed
    let heightRemaining = finalHeight - availableHeight;
    let currentPage = 1;

    while (heightRemaining > 0) {
      currentPage++;
      pdf.addPage([pageWidth, pageHeight], 'landscape');
      
      const position = -(currentPage - 1) * availableHeight + yPosition;
      pdf.addImage(imgData, 'PNG', xPosition, position, finalWidth, finalHeight);
      
      heightRemaining -= availableHeight;
    }

    // Save the PDF
    pdf.save(filename);
    
  } catch (error) {
    console.error('PDF Error:', error);
    alert('Error generating PDF');
  }
};
