import { PDFDocument } from 'pdf-lib';

// Download a single page
export async function downloadSinglePage(pageData, pageNo) {
  const pdfDoc = await PDFDocument.create();
  const imgBytes = await fetch(pageData.base64Page).then(res => res.arrayBuffer());
  const img = await pdfDoc.embedPng(imgBytes); // or embedJpg if JPG

  const page = pdfDoc.addPage([img.width, img.height]);
  page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });

  const pdfBytes = await pdfDoc.save();
  triggerDownload(pdfBytes, `Page_${pageNo}.pdf`);
}

// Download all pages
export async function downloadAllPages(results) {
  const pdfDoc = await PDFDocument.create();

  for (const [index, item] of results.entries()) {
    const imgBytes = await fetch(item.base64Page).then(res => res.arrayBuffer());
    const img = await pdfDoc.embedPng(imgBytes);

    const page = pdfDoc.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }

  const pdfBytes = await pdfDoc.save();
  triggerDownload(pdfBytes, `All_Pages.pdf`);
}

// Helper to trigger download
function triggerDownload(pdfBytes, filename) {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// Get total number of pages in a PDF (File or ArrayBuffer)
export async function getTotalNoOfPagesInPdf(file) {
  try {
    let arrayBuffer;

    if (file instanceof File) {
      // Case: file uploaded from <input type="file">
      arrayBuffer = await file.arrayBuffer();
    } else if (file instanceof ArrayBuffer) {
      // Case: already an ArrayBuffer
      arrayBuffer = file;
    } else {
      throw new Error("Unsupported input type. Expected File or ArrayBuffer.");
    }

    const pdfDoc = await PDFDocument.load(arrayBuffer);
    return pdfDoc.getPageCount();
  } catch (err) {
    console.error("Error reading total pages:", err);
    return 0;
  }
}
