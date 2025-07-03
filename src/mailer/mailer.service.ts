import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
// import { MailerService } from '@nestjs-modules/mailer';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AppMailerService {
    
  private transporter: nodemailer.Transporter;
  constructor(private readonly mailerService: MailerService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', //  SMTP provider
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
  }

  async sendPassresetMail(to: string, username: string) {
    const html = `<h1>Welcome, ${username}!</h1><p>your password is successfully reset.</p>`;
    await this.transporter.sendMail({
      from: `"No Reply" <${process.env.GMAIL_USER}>`,
      to,
      subject: 'Welcome!',
      html,
    });
    console.log(`Welcome email sent to ${to}`);
  }
    async sendOrderConfirmationMail(to: string, orderDetails: any) {
        const html = `<h1>Order Confirmation</h1><p>Your order has been placed successfully.</p><pre>${JSON.stringify(orderDetails, null, 2)}</pre>`;
        await this.transporter.sendMail({
        from: `"No Reply" <${process.env.GMAIL_USER}>`,
        to,
        subject: 'Order Confirmation',
        html,
        });
        console.log(`Order confirmation email sent to ${to}`);
    }
  async sendWelcomeMail(to: string, username: string, accessToken: string, otp: string) {
    await this.mailerService.sendMail({
      to,
      subject: 'Welcome!',
      template: 'welcome', // path to template file
      context: { username, accessToken, otp },
    });
    console.log(`Welcome email sent to ${to}`);
  }
}
