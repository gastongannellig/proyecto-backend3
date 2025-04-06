import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import config from '../config/config.js';

export class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // use SSL
      auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verificar conexión
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('Error en la configuración del email:', error);
      } else {
        console.log('Servidor listo para enviar emails');
      }
    });
  }

  async generateTicketPDF(ticket) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4'
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));


      const styles = {
        header: {
          fontSize: 28,
          font: 'Helvetica-Bold',
          color: '#1a1a1a'
        },
        subheader: {
          fontSize: 14,
          font: 'Helvetica-Bold',
          color: '#333333'
        },
        normal: {
          fontSize: 12,
          font: 'Helvetica',
          color: '#4a4a4a'
        },
        highlight: {
          fontSize: 16,
          font: 'Helvetica-Bold',
          color: '#333333'
        }
      };


      doc.lineWidth(2)
         .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
         .stroke('#333333');


      doc.font(styles.header.font)
         .fontSize(styles.header.fontSize)
         .text('Ticket de Compra', { align: 'center' });
      
      doc.moveDown();


      doc.font(styles.subheader.font)
         .fontSize(styles.subheader.fontSize)
         .text(`Código: ${ticket.code}`);
      
      doc.font(styles.normal.font)
         .fontSize(styles.normal.fontSize)
         .text(`Fecha: ${ticket.purchase_datetime}`);
      
      doc.text(`Cliente: ${ticket.details.fullName}`);
      doc.text(`Email: ${ticket.purchaser}`);
      doc.text(`Teléfono: ${ticket.details.phone}`);
      doc.moveDown();

      // Tabla de productos
      doc.font(styles.subheader.font)
         .fontSize(styles.subheader.fontSize)
         .text('Productos Comprados:', { underline: true });
      
      doc.moveDown();
      ticket.details.products.forEach(product => {
        doc.font(styles.normal.font)
           .fontSize(styles.normal.fontSize)
           .text(
             `${product.title} - Cantidad: ${product.quantity} - Precio: $${Number(product.price).toFixed(2)}`
           );
      });
      doc.moveDown();
      doc.font(styles.highlight.font)
         .fontSize(styles.highlight.fontSize)
         .text(`Total: $${Number(ticket.amount).toFixed(2)}`, { align: 'right' });

      doc.end();
    });
  }

  async sendTicketEmail(ticket, pdfBuffer) {
    const mailOptions = {
      from: config.EMAIL_USER,
      to: ticket.purchaser,
      subject: `Ticket de Compra - Código ${ticket.code}`,
      html: `
        <h1>¡Gracias por tu compra!</h1>
        <p>Adjunto encontrarás el ticket de tu compra.</p>
        <p>Detalles de la compra:</p>
        <ul>
          <li>Código: ${ticket.code}</li>
          <li>Fecha: ${ticket.purchase_datetime}</li>
          <li>Total: $${ticket.amount}</li>
        </ul>
        <p>¡Esperamos verte pronto nuevamente!</p>
      `,
      attachments: [{
        filename: 'ticket.pdf',
        content: pdfBuffer
      }]
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error enviando email:', error);
      throw error;
    }
  }
}

export default new EmailService();