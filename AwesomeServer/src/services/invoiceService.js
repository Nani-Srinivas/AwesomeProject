import PDFDocument from 'pdfkit';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

/**
 * Generates an invoice PDF document as a buffer.
 * @param {object} data - The data for the invoice.
 * @returns {Promise<Buffer>} - A promise that resolves with the PDF buffer.
 */
const generateInvoicePDF = (data) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });

    // --- Add content to the PDF ---

    // Header
    doc
      .fontSize(20)
      .text('INVOICE', { align: 'center' });

    // Dummy data for now - this will be replaced with real data
    doc.fontSize(12).text(`Invoice #: ${data.billNo || 'N/A'}`)
    doc.text(`Customer: ${data.customerName || 'N/A'}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);

    doc.moveDown(2);

    // Table Header
    doc.font('Helvetica-Bold');
    doc.text('Item', 50, 200)
       .text('Quantity', 250, 200)
       .text('Price', 350, 200)
       .text('Total', 450, 200);
    doc.font('Helvetica');

    // Dummy table rows
    let y = 220;
    const items = data.items || [{ name: 'Sample Item', quantity: 1, price: 100 }];
    items.forEach(item => {
        doc.text(item.name, 50, y)
           .text(item.quantity.toString(), 250, y)
           .text(`$${item.price.toFixed(2)}`, 350, y)
           .text(`$${(item.quantity * item.price).toFixed(2)}`, 450, y);
        y += 20;
    });

    doc.moveDown(2);

    // Footer
    doc.fontSize(14).text(`Grand Total: $${(data.grandTotal || 100).toFixed(2)}`, { align: 'right' });

    // Finalize the PDF and end the stream
    doc.end();
  });
};

/**
 * Uploads a PDF buffer to Cloudinary.
 * @param {Buffer} pdfBuffer - The PDF buffer to upload.
 * @param {string} fileName - The desired file name for the upload.
 * @returns {Promise<string>} - A promise that resolves with the secure URL of the uploaded file.
 */
const uploadPDFToCloudinary = (pdfBuffer, fileName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'invoices', // Optional: store in a folder named 'invoices'
        public_id: fileName,
        resource_type: 'raw', // Use 'raw' for files like PDFs
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (result) {
          resolve(result.secure_url);
        } else {
          reject(new Error('Cloudinary upload result is undefined.'));
        }
      }
    );

    streamifier.createReadStream(pdfBuffer).pipe(uploadStream);
  });
};

export const invoiceService = {
  generateInvoicePDF,
  uploadPDFToCloudinary,
};
