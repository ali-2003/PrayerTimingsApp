// utils/pdfExport.js - jsPDF with html2canvas for better PDF control
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportTableToPDF = async (tableElement, filename = 'prayer-times.pdf', monthName = '') => {
  try {
    if (!tableElement) {
      alert('Error: Cannot find table to export');
      return;
    }

    // Get element dimensions
    const elementWidth = tableElement.scrollWidth;
    const elementHeight = tableElement.scrollHeight;

    // Create canvas from HTML with high quality
    const canvas = await html2canvas(tableElement, {
      scale: 3,  // Higher quality for portrait
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: elementWidth,
      height: elementHeight,
      windowWidth: elementWidth,
      windowHeight: elementHeight,
    });

    // Create PDF - portrait for better fit
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: false
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgData = canvas.toDataURL('image/jpeg', 0.99);
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = imgWidth / imgHeight;

    // Use almost entire page - 2mm margins
    let finalWidth = pdfWidth - 4;
    let finalHeight = finalWidth / ratio;

    // If too tall, scale down to fit
    if (finalHeight > pdfHeight - 4) {
      finalHeight = pdfHeight - 4;
      finalWidth = finalHeight * ratio;
    }

    // Center the image
    const xOffset = (pdfWidth - finalWidth) / 2;
    const yOffset = 2;

    pdf.addImage(imgData, 'JPEG', xOffset, yOffset, finalWidth, finalHeight);

    // Handle multi-page if needed
    let heightRemaining = finalHeight - (pdfHeight - 4);
    let pageNum = 1;

    while (heightRemaining > 0.5) {
      pageNum++;
      pdf.addPage([pdfWidth, pdfHeight], 'landscape');
      const nextYPos = yOffset - ((pageNum - 1) * (pdfHeight - 4));
      pdf.addImage(imgData, 'JPEG', xOffset, nextYPos, finalWidth, finalHeight);
      heightRemaining -= (pdfHeight - 4);
    }

    pdf.save(filename);

  } catch (error) {
    console.error('PDF Error:', error);
    alert('Error generating PDF: ' + error.message);
  }
};
