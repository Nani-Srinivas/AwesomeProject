import RNFS from 'react-native-fs';
const RNHTMLtoPDF = require('react-native-html-to-pdf');

interface ReceiptData {
    receiptNumber: string;
    customerName: string;
    paymentDate: string;
    amount: number;
    paymentMethod: string;
    billsAllocated: {
        billNo: string;
        period: string;
        amountPaid: number;
    }[];
    remainingBalance: number;
}

export const generatePaymentReceipt = async (data: ReceiptData): Promise<string> => {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {
                font-family: 'Arial', sans-serif;
                padding: 40px;
                color: #333;
            }
            .header {
                text-align: center;
                margin-bottom: 40px;
                border-bottom: 3px solid #1E73B8;
                padding-bottom: 20px;
            }
            .header h1 {
                color: #1E73B8;
                margin: 0;
                font-size: 32px;
            }
            .header p {
                color: #666;
                margin: 5px 0 0 0;
                font-size: 16px;
            }
            .receipt-info {
                display: table;
                width: 100%;
                margin-bottom: 30px;
            }
            .info-row {
                display: table-row;
            }
            .info-label {
                display: table-cell;
                font-weight: bold;
                padding: 8px 0;
                width: 40%;
                color: #555;
            }
            .info-value {
                display: table-cell;
                padding: 8px 0;
                color: #333;
            }
            .amount-box {
                background: #F0F9FF;
                border: 2px solid #1E73B8;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                margin: 30px 0;
            }
            .amount-label {
                font-size: 14px;
                color: #666;
                text-transform: uppercase;
                margin: 0;
            }
            .amount-value {
                font-size: 36px;
                color: #1E73B8;
                font-weight: bold;
                margin: 10px 0;
            }
            .bills-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }
            .bills-table th {
                background: #1E73B8;
                color: white;
                padding: 12px;
                text-align: left;
                font-size: 14px;
            }
            .bills-table td {
                border-bottom: 1px solid #ddd;
                padding: 12px;
                font-size: 14px;
            }
            .bills-table tr:last-child td {
                border-bottom: 2px solid #1E73B8;
            }
            .summary {
                background: #FAFAFA;
                padding: 20px;
                border-radius: 8px;
                margin-top: 30px;
            }
            .summary-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                font-size: 16px;
            }
            .summary-row.total {
                font-weight: bold;
                font-size: 18px;
                border-top: 2px solid #1E73B8;
                margin-top: 10px;
                padding-top: 15px;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                color: #999;
                font-size: 12px;
            }
            .thank-you {
                text-align: center;
                font-size: 18px;
                color: #1E73B8;
                margin: 30px 0;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>PAYMENT RECEIPT</h1>
            <p>Receipt #${data.receiptNumber}</p>
        </div>

        <div class="receipt-info">
            <div class="info-row">
                <div class="info-label">Customer Name:</div>
                <div class="info-value">${data.customerName}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Payment Date:</div>
                <div class="info-value">${data.paymentDate}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Payment Method:</div>
                <div class="info-value">${data.paymentMethod}</div>
            </div>
        </div>

        <div class="amount-box">
            <p class="amount-label">Amount Paid</p>
            <p class="amount-value">₹${data.amount.toFixed(2)}</p>
        </div>

        <h3 style="color: #1E73B8; margin-top: 30px;">Bills Paid</h3>
        <table class="bills-table">
            <thead>
                <tr>
                    <th>Bill Number</th>
                    <th>Period</th>
                    <th>Amount Paid</th>
                </tr>
            </thead>
            <tbody>
                ${data.billsAllocated.map(bill => `
                    <tr>
                        <td>${bill.billNo}</td>
                        <td>${bill.period}</td>
                        <td>₹${bill.amountPaid.toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="summary">
            <div class="summary-row">
                <span>Total Paid:</span>
                <span>₹${data.amount.toFixed(2)}</span>
            </div>
            <div class="summary-row total">
                <span>Remaining Balance:</span>
                <span>₹${data.remainingBalance.toFixed(2)}</span>
            </div>
        </div>

        <p class="thank-you">Thank you for your payment!</p>

        <div class="footer">
            <p>This is a computer-generated receipt and does not require a signature.</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
    </body>
    </html>
    `;

    try {
        const options = {
            html: html,
            fileName: `Payment_Receipt_${data.receiptNumber}`,
            directory: 'Documents',
        };

        const file = await RNHTMLtoPDF.convert(options);
        return file.filePath || '';
    } catch (error) {
        console.error('Error generating receipt PDF:', error);
        throw error;
    }
};
