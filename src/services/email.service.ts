import { google } from 'googleapis';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

export class EmailService {
  private static auth: any;
  private static gmail: any;

  /**
   * Initializes the Google JWT Auth with Domain-Wide Delegation.
   */
  private static async getAuth() {
    if (this.auth) return this.auth;

    // Support for Railway/Production: Check for raw JSON string in environment variable
    if (process.env.GMAIL_SERVICE_ACCOUNT_JSON) {
      const credentials = JSON.parse(process.env.GMAIL_SERVICE_ACCOUNT_JSON);
      this.auth = new google.auth.JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: ['https://www.googleapis.com/auth/gmail.send'],
        subject: process.env.GMAIL_SENDER_EMAIL || 'noreply@big.co.rw',
      });
    } else {
      // Local development: use the JSON file path
      const keyPath = path.resolve(process.env.GMAIL_SERVICE_ACCOUNT_PATH || './google-service-account.json');
      this.auth = new google.auth.JWT({
        keyFile: keyPath,
        scopes: ['https://www.googleapis.com/auth/gmail.send'],
        subject: process.env.GMAIL_SENDER_EMAIL || 'noreply@big.co.rw',
      });
    }

    return this.auth;
  }

  /**
   * Returns a singleton Gmail client instance.
   */
  private static async getGmailClient() {
    if (this.gmail) return this.gmail;
    const auth = await this.getAuth();
    this.gmail = google.gmail({ version: 'v1', auth });
    return this.gmail;
  }

  /**
   * Sends an email using the Gmail API.
   * @param to Recipient email address
   * @param subject Email subject
   * @param html HTML content of the email
   * @param templateType Categorized type for logging
   * @param relatedEntity Optional linking to a transaction or user
   * @param existingLogId Optional ID of an existing log entry (for retries)
   */
  static async sendEmail(
    to: string, 
    subject: string, 
    html: string, 
    templateType: string,
    relatedEntity?: { type: string; id: string },
    existingLogId?: number
  ) {
    let log;
    if (existingLogId) {
      log = await prisma.systemEmailLog.update({
        where: { id: existingLogId },
        data: { 
          status: 'PENDING',
          retryCount: { increment: 1 }
        },
      });
    } else {
      log = await prisma.systemEmailLog.create({
        data: {
          recipientEmail: to,
          templateType: templateType,
          status: 'PENDING',
          relatedEntityType: relatedEntity?.type,
          relatedEntityId: relatedEntity?.id,
        },
      });
    }

    try {
      const gmail = await this.getGmailClient();
      
      const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
      const messageParts = [
        `From: ${process.env.GMAIL_SENDER_EMAIL}`,
        `To: ${to}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${utf8Subject}`,
        '',
        html,
      ];
      const message = messageParts.join('\r\n');

      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });

      // Update log to SENT
      await prisma.systemEmailLog.update({
        where: { id: log.id },
        data: { status: 'SENT' },
      });

      return { success: true, logId: log.id };
    } catch (error: any) {
      // Update log to FAILED
      await prisma.systemEmailLog.update({
        where: { id: log.id },
        data: { 
          status: 'FAILED',
          errorMessage: error.message,
        },
      });
      
      console.error(`[EmailService] Failed to send email to ${to}:`, error.message);
      throw error;
    }
  }
}
