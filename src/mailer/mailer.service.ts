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

  async sendWelcomeMail(
    to: string,
    username: string,
    accessToken: string,
    otp: string,
  ) {
    await this.mailerService.sendMail({
      to,
      subject: 'Welcome!',
      template: 'welcome',
      context: { username, accessToken, otp },
    });
    console.log(`Welcome email sent to ${to}`);
  }

  async sendDeliveryOtpMail(
    to: string,
    username: string,
    otp: string,
    orderId: string,
  ) {
    await this.mailerService.sendMail({
      to,
      subject: 'Your Delivery Verification Code',
      template: 'delivery-otp',
      context: { username, otp, orderId },
    });
    console.log(`Delivery OTP email sent to ${to}`);
  }
}
