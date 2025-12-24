import { Controller, Post, Body, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send-manual-report')
  async sendManualReport(@Body('email') email?: string) {
    try {
      const targetEmail = email || process.env.REPORT_EMAIL || process.env.EMAIL_USER;
      console.log('Received request to send email to:', targetEmail);
      const result = await this.emailService.sendManualReport(targetEmail);
      return result;
    } catch (error) {
      console.error('Controller error:', error.message);
      console.error('Full error:', error);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to send email',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
