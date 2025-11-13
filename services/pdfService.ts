import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MCQ, Flashcard } from '../types';

// A helper function to add header and footer to each page
const addHeaderAndFooter = (doc: jsPDF, title: string) => {
    const pageCount = doc.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Skip for title page
        if (i === 1) continue;

        // Header
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text(title, 40, 30);
        doc.line(40, 35, pageWidth - 40, 35);

        // Footer
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 40, pageHeight - 30, { align: 'right' });
    }
}


export const exportToPdf = (title: string, summary: string, mcqs: MCQ[], flashcards: Flashcard[]) => {
  const doc = new jsPDF('p', 'pt', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // --- Title Page ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(45, 55, 72); // dark slate/blue
  doc.text('Study Assistant Export', pageWidth / 2, pageHeight / 2 - 60, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(16);
  doc.setTextColor(71, 85, 105);
  doc.text(`Source: ${title}`, pageWidth / 2, pageHeight / 2 - 30, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  const date = new Date().toLocaleDateString();
  doc.text(`Generated on: ${date}`, pageWidth / 2, pageHeight / 2 - 10, { align: 'center' });

  // --- Summary Section ---
  if (summary) {
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(45, 55, 72);
    doc.text('Summary', 40, 60);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);
    const splitSummary = doc.splitTextToSize(summary, pageWidth - 80); // 40pt margins
    doc.text(splitSummary, 40, 80);
  }

  // --- Flashcards Section ---
  if (flashcards.length > 0) {
    doc.addPage();
    autoTable(doc, {
        startY: 80,
        head: [['Term', 'Definition']],
        body: flashcards.map(card => [card.term, card.definition]),
        theme: 'grid',
        headStyles: {
            fillColor: [45, 55, 72],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 12,
            halign: 'center',
        },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 150 },
            1: { cellWidth: 'auto' },
        },
        styles: {
            font: 'helvetica',
            fontSize: 10,
            cellPadding: 8,
        },
        margin: { top: 60, right: 40, bottom: 40, left: 40 },
        didDrawPage: (data) => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(18);
            doc.setTextColor(45, 55, 72);
            doc.text('Key Terms & Definitions', 40, 60);
        }
    });
  }

  // --- MCQ Section ---
  if (mcqs.length > 0) {
    doc.addPage();
    const mcqBody = mcqs.flatMap((mcq, index) => {
        const questionRow = { content: `${index + 1}. ${mcq.question}`, styles: { fontStyle: 'bold', fillColor: '#F1F5F9', textColor: '#000' } };
        const optionRows = mcq.options.map((opt, i) => `   ${String.fromCharCode(65 + i)}. ${opt}`);
        return [[questionRow], ...optionRows.map(o => [o])];
    });

    autoTable(doc, {
        startY: 80,
        body: mcqBody,
        theme: 'plain',
        styles: {
            font: 'helvetica',
            fontSize: 11,
            cellPadding: 5,
        },
        margin: { top: 60, right: 40, bottom: 40, left: 40 },
        didDrawPage: (data) => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(18);
            doc.setTextColor(45, 55, 72);
            doc.text('MCQ Self-Test', 40, 60);
        }
    });
  }
  
  // --- Answer Key Section ---
  if (mcqs.length > 0) {
    doc.addPage();
    autoTable(doc, {
        startY: 80,
        head: [['Question #', 'Correct Answer']],
        body: mcqs.map((mcq, index) => [`${index + 1}`, mcq.correctAnswer]),
        theme: 'striped',
        headStyles: {
            fillColor: [71, 85, 105], // slate-600
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 11,
        },
        styles: {
            font: 'helvetica',
            fontSize: 10,
        },
        margin: { top: 60, right: 40, bottom: 40, left: 40 },
        didDrawPage: (data) => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(18);
            doc.setTextColor(45, 55, 72);
            doc.text('Answer Key', 40, 60);
        }
    });
  }

  addHeaderAndFooter(doc, `Source: ${title}`);

  doc.save(`${title.replace(/\.[^/.]+$/, "")}_study_guide.pdf`);
};