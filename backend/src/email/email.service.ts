import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SlotService } from '../slot/slot.service';
import * as nodemailer from 'nodemailer';
import * as PDFDocument from 'pdfkit';
import { Readable } from 'stream';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly slotService: SlotService) {
    // Configure email transporter (using Gmail as example)
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;
    
    if (!emailUser || !emailPassword) {
      this.logger.warn('Email credentials not configured. Email service will not work.');
      this.logger.warn('Please set EMAIL_USER and EMAIL_PASSWORD in .env file');
    }
    
    // Try multiple configurations for better compatibility
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
      },
      connectionTimeout: 20000,
      greetingTimeout: 10000,
      socketTimeout: 45000,
      debug: false,
      logger: false
    });
    
    // Verify transporter configuration
    this.verifyTransporter();
  }

  private async verifyTransporter() {
    try {
      await this.transporter.verify();
      this.logger.log('✓ Email transporter configured successfully');
      this.logger.log(`✓ Email user: ${process.env.EMAIL_USER}`);
      this.logger.log(`✓ Email password configured: ${process.env.EMAIL_PASSWORD ? 'Yes (length: ' + process.env.EMAIL_PASSWORD.length + ')' : 'No'}`);
      this.logger.log(`✓ Report recipient: ${process.env.REPORT_EMAIL}`);
    } catch (error) {
      this.logger.error('✗ Email transporter verification failed:');
      this.logger.error(`Error: ${error.message}`);
      if (error.code) {
        this.logger.error(`Error code: ${error.code}`);
      }
      this.logger.error('Common issues:');
      this.logger.error('  1. Make sure 2-factor authentication is enabled on your Gmail account');
      this.logger.error('  2. Generate an App Password (not your regular Gmail password)');
      this.logger.error('  3. Remove any spaces from the App Password in .env file');
      this.logger.error('  4. Check if "Less secure app access" is enabled (if not using App Password)');
    }
  }

  // Schedule times: 9:30 AM
  @Cron('30 9 * * 1-6', {
    timeZone: 'Asia/Kolkata',
  })
  async sendReport930AM() {
    await this.sendAttendanceReport('9:30 AM', 'Slot 1');
  }

  // Schedule times: 10:30 AM
  @Cron('30 10 * * 1-6', {
    timeZone: 'Asia/Kolkata',
  })
  async sendReport1030AM() {
    await this.sendAttendanceReport('10:30 AM', 'Slot 2');
  }

  // Schedule times: 11:10 AM (Break time)
  @Cron('10 11 * * 1-6', {
    timeZone: 'Asia/Kolkata',
  })
  async sendReport1110AM() {
    await this.sendAttendanceReport('11:10 AM', 'Slots 1-2 Summary');
  }

  // Schedule times: 12:30 PM
  @Cron('30 12 * * 1-6', {
    timeZone: 'Asia/Kolkata',
  })
  async sendReport1230PM() {
    await this.sendAttendanceReport('12:30 PM', 'Slot 3');
  }

  // Schedule times: 1:30 PM (13:30)
  @Cron('30 13 * * 1-6', {
    timeZone: 'Asia/Kolkata',
  })
  async sendReport130PM() {
    await this.sendAttendanceReport('1:30 PM', 'Slot 4');
  }

  // Schedule times: 2:45 PM (14:45)
  @Cron('45 14 * * 1-6', {
    timeZone: 'Asia/Kolkata',
  })
  async sendReport245PM() {
    await this.sendAttendanceReport('2:45 PM', 'Break Summary');
  }

  // Schedule times: 3:30 PM (15:30)
  @Cron('30 15 * * 1-6', {
    timeZone: 'Asia/Kolkata',
  })
  async sendReport330PM() {
    await this.sendAttendanceReport('3:30 PM', 'Slot 5');
  }

  private async sendAttendanceReport(time: string, slotDescription: string) {
    try {
      const today = new Date();
      const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
      
      this.logger.log(`Generating attendance report for ${time} on ${dayOfWeek}`);

      // Fetch attendance data for today
      const observations = await this.slotService.findAll();
      const todayObservations = observations.filter(obs => {
        const obsDate = new Date(obs.createdAt);
        return obsDate.toDateString() === today.toDateString();
      });

      // Generate PDF
      const pdfBuffer = await this.generatePDF(todayObservations, time, dayOfWeek, slotDescription);

      // Send email
      const recipientEmail = process.env.REPORT_EMAIL || 'admin@example.com';
      
      const mailOptions = {
        from: process.env.EMAIL_USER || 'your-email@gmail.com',
        to: recipientEmail,
        subject: `Attendance Report - ${dayOfWeek} ${time} - ${slotDescription}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f6f8fc; border-radius: 10px;">
            <h2 style="color: #1e293b; margin-bottom: 20px;">Attendance Report</h2>
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="font-size: 16px; color: #64748b; margin-bottom: 10px;">
                <strong>Date:</strong> ${today.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p style="font-size: 16px; color: #64748b; margin-bottom: 10px;">
                <strong>Time:</strong> ${time}
              </p>
              <p style="font-size: 16px; color: #64748b; margin-bottom: 10px;">
                <strong>Slot:</strong> ${slotDescription}
              </p>
              <p style="font-size: 16px; color: #64748b;">
                <strong>Total Observations:</strong> ${todayObservations.length}
              </p>
            </div>
            <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb;">
              <p style="color: #1e293b; margin: 0;">
                Please find the detailed attendance report attached as PDF.
              </p>
            </div>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="color: #64748b; font-size: 12px; margin: 0;">
                This is an automated report from Slot Observation System
              </p>
            </div>
          </div>
        `,
        attachments: [
          {
            filename: `attendance-report-${dayOfWeek}-${time.replace(/:/g, '-').replace(/ /g, '')}.pdf`,
            content: pdfBuffer,
          },
        ],
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Attendance report sent successfully for ${time} on ${dayOfWeek}`);
    } catch (error) {
      this.logger.error(`Failed to send attendance report: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
      if (error.code) {
        this.logger.error(`Error code: ${error.code}`);
      }
      if (error.command) {
        this.logger.error(`SMTP command: ${error.command}`);
      }
      if (error.response) {
        this.logger.error(`SMTP response: ${error.response}`);
      }
      // Don't throw error to prevent cron job from stopping
      // throw error;
    }
  }

  private async generatePDF(
    observations: any[],
    time: string,
    dayOfWeek: string,
    slotDescription: string,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new (PDFDocument as any)({ margin: 40, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const today = new Date();
      const pageWidth = doc.page.width - 80;
      
      // Header with logos (placeholder text for logos)
      const startY = 40;
      doc.fontSize(10).fillColor('#000000');
      doc.text('CHARUSAT', 50, startY, { width: 80, align: 'left' });
      doc.text('CSPIT', pageWidth + 30, startY, { width: 80, align: 'right' });
      
      doc.moveDown(0.5);
      
      // University Title
      doc.fontSize(14).fillColor('#000000').font('Helvetica-Bold');
      doc.text('Charotar University of Science and Technology', 50, startY + 20, { 
        width: pageWidth, 
        align: 'center' 
      });
      
      doc.fontSize(10).font('Helvetica');
      doc.text('Computer Science and Engineering Department', 50, doc.y + 5, { 
        width: pageWidth, 
        align: 'center' 
      });
      doc.text('Chandubhai S Patel Institute of Technology (CSPIT)', 50, doc.y + 2, { 
        width: pageWidth, 
        align: 'center' 
      });
      
      doc.moveDown(0.3);
      
      // Date and Time Info
      const dateStr = `Date: ${today.getDate()} ${today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} | Time: ${time}`;
      doc.fontSize(9).fillColor('#000000');
      doc.text(dateStr, 50, doc.y, { width: pageWidth, align: 'center' });
      doc.text(`Day: ${dayOfWeek}`, 50, doc.y + 2, { width: pageWidth, align: 'center' });
      
      doc.moveDown(0.8);
      
      // Horizontal line
      doc.strokeColor('#000000').lineWidth(1);
      doc.moveTo(50, doc.y).lineTo(pageWidth + 50, doc.y).stroke();
      doc.moveDown(0.5);

      // Define time slots for lectures (1-hour slots)
      const lectureSlots = [
        { id: 1, label: 'Slot 1\n9:10-10:10', time: '9:10-10:10', keywords: ['slot 1', 'slot-1', '9:10'] },
        { id: 2, label: 'Slot 2\n10:10-11:10', time: '10:10-11:10', keywords: ['slot 2', 'slot-2', '10:10'] },
        { id: 3, label: 'Slot 3\n12:10-13:10', time: '12:10-13:10', keywords: ['slot 3', 'slot-3', '12:10'] },
        { id: 4, label: 'Slot 4\n13:10-14:10', time: '13:10-14:10', keywords: ['slot 4', 'slot-4', '13:10', '1:10'] },
        { id: 5, label: 'Slot 5\n14:20-15:20', time: '14:20-15:20', keywords: ['slot 5', 'slot-5', '14:20', '2:20'] },
        { id: 6, label: 'Slot 6\n15:20-16:20', time: '15:20-16:20', keywords: ['slot 6', 'slot-6', '15:20', '3:20'] },
      ];

      // Define lab sessions (2-hour combined slots)
      const labSlots = [
        { id: '1-2', label: 'Lab Session 1\n9:10-11:10', time: '9:10-11:10', keywords: ['slot 1', 'slot-1', 'slot 2', 'slot-2', '9:10', '10:10'] },
        { id: '3-4', label: 'Lab Session 2\n12:10-14:10', time: '12:10-14:10', keywords: ['slot 3', 'slot-3', 'slot 4', 'slot-4', '12:10', '13:10', '1:10'] },
        { id: '5-6', label: 'Lab Session 3\n14:20-16:20', time: '14:20-16:20', keywords: ['slot 5', 'slot-5', 'slot 6', 'slot-6', '14:20', '15:20', '2:20', '3:20'] },
      ];

      // Define all rooms that should appear
      const allLabRooms = ['631', '632', '633', '634', '638', '515'];
      const allClassRooms = ['505', '506', '507', '508'];

      // Separate Labs and Classes - 634 is a LAB not a class
      const labs = observations.filter(obs => {
        if (!obs.location) return false;
        const loc = obs.location.toString().toLowerCase();
        return loc.includes('lab') || allLabRooms.some(room => obs.location.includes(room));
      });
      
      const classes = observations.filter(obs => {
        if (!obs.location) return false;
        const loc = obs.location.toString().toLowerCase();
        return !loc.includes('lab') && allClassRooms.some(room => obs.location.includes(room));
      });

      // Helper function to match observation to slot
      const matchSlot = (obs: any, slot: any) => {
        if (!obs.slotName) return false;
        const slotNameLower = obs.slotName.toLowerCase();
        return slot.keywords.some(keyword => slotNameLower.includes(keyword));
      };

      // Helper function to create table
      const createTable = (title: string, items: any[], allRooms: string[], slots: any[], startY: number) => {
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000');
        doc.text(title, 50, startY);
        doc.moveDown(0.5);

        const tableTop = doc.y;
        const cellHeight = 110; // Increased from 90 to 110 for more space
        const numCols = slots.length + 1;
        const colWidth = pageWidth / numCols;
        const cellPadding = 6; // Reduced from 8 to 6
        const innerCellWidth = colWidth - (2 * cellPadding);
        
        // Table header with blue background
        doc.rect(50, tableTop, pageWidth, 25).fillAndStroke('#4A90E2', '#000000');
        
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#FFFFFF');
        doc.text('Room', 55, tableTop + 8, { width: colWidth - 10 });
        
        slots.forEach((slot, index) => {
          const x = 50 + colWidth * (index + 1);
          doc.text(slot.label, x + 5, tableTop + 4, { 
            width: colWidth - 10, 
            align: 'center',
            lineBreak: false 
          });
        });

        // Use all rooms regardless of whether they have data
        const rooms = allRooms;
        
        let currentY = tableTop + 25;
        
        // Table rows
        rooms.forEach((room) => {
          // Draw row cells
          for (let i = 0; i < numCols; i++) {
            doc.rect(50 + colWidth * i, currentY, colWidth, cellHeight).stroke('#000000');
          }
          
          // Room name
          doc.fontSize(9).font('Helvetica').fillColor('#000000');
          doc.text(room, 55, currentY + 12, { width: colWidth - 10, lineBreak: false });
          doc.fontSize(7).fillColor('#666666');
          doc.text(title === 'LABS' ? 'Lab' : 'Class', 55, currentY + 24, { width: colWidth - 10, lineBreak: false });
          
          // Fill in observations for each slot
          slots.forEach((slot, slotIndex) => {
            const x = 50 + colWidth * (slotIndex + 1);
            const cellX = x + cellPadding;
            
            const roomObs = items.filter(obs => 
              obs.location && obs.location.includes(room) && matchSlot(obs, slot)
            );
            
            if (roomObs.length > 0) {
              const obs = roomObs[0];
              
              // Log observation data for debugging
              this.logger.log(`Processing cell - Room: ${room}, Slot: ${slot.label}`);
              this.logger.log(`  SlotName: ${obs.slotName}`);
              this.logger.log(`  Amount: ${obs.amount}`);
              this.logger.log(`  Status: "${obs.status}"`);
              this.logger.log(`  Notes: "${obs.notes}"`);
              
              let yPos = currentY + cellPadding + 2;
              const maxCellY = currentY + cellHeight - cellPadding - 2;
              
              // Helper to safely add text and update yPos
              const addText = (text: string, fontSize: number, fontStyle: string, color: string, options: any = {}) => {
                if (yPos >= maxCellY) return;
                
                doc.fontSize(fontSize).font(fontStyle).fillColor(color);
                const textOptions = {
                  width: innerCellWidth - 8,
                  align: 'left',
                  lineBreak: true,
                  ...options
                };
                
                // Calculate text height before rendering
                const textHeight = doc.heightOfString(text, textOptions);
                const availableHeight = maxCellY - yPos;
                
                if (textHeight > availableHeight) {
                  textOptions.height = availableHeight;
                  textOptions.ellipsis = true;
                }
                
                doc.text(text, cellX + 4, yPos, textOptions);
                yPos += Math.min(textHeight, availableHeight) + 1.5; // Reduced from 2 to 1.5
              };
              
              // 1. Subject name (clean format)
              let slotName = obs.slotName || '';
              slotName = slotName.replace(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*-\s*/i, '');
              slotName = slotName.replace(/Slot \d+ - /, '');
              
              addText(slotName, 7, 'Helvetica-Bold', '#000000'); // Reduced from 7.5 to 7
              
              // 2. Faculty information from notes
              if (obs.notes && yPos < maxCellY - 8) {
                const noteParts = obs.notes.split(' | ');
                
                // Primary faculty
                const facultyPart = noteParts.find((p: string) => p.startsWith('Faculty:'));
                if (facultyPart) {
                  const facultyName = facultyPart.replace('Faculty: ', '').trim();
                  addText(facultyName, 6.5, 'Helvetica', '#0066cc');
                }
                
                // Batch info (for labs)
                const batchPart = noteParts.find((p: string) => p.startsWith('Batch:'));
                if (batchPart && yPos < maxCellY - 8) {
                  const batchInfo = batchPart.replace('Batch: ', '').trim();
                  addText(batchInfo, 6, 'Helvetica', '#666666');
                }
                
                // Division
                const divisionPart = noteParts.find((p: string) => p.startsWith('Division:'));
                if (divisionPart && yPos < maxCellY - 8) {
                  const divisionInfo = divisionPart.replace('Division: ', '').trim();
                  addText(divisionInfo, 6, 'Helvetica', '#666666');
                }
                
                // Secondary faculty (for dual batch labs)
                const faculty2Part = noteParts.find((p: string) => p.startsWith('Faculty2:'));
                if (faculty2Part && yPos < maxCellY - 8) {
                  yPos += 2; // Extra spacing before second batch
                  const faculty2Name = faculty2Part.replace('Faculty2: ', '').trim();
                  addText(`Batch 2: ${faculty2Name}`, 6.5, 'Helvetica', '#0066cc');
                }
                
                const batch2Part = noteParts.find((p: string) => p.startsWith('Batch2:'));
                if (batch2Part && yPos < maxCellY - 8) {
                  const batch2Info = batch2Part.replace('Batch2: ', '').trim();
                  addText(batch2Info, 6, 'Helvetica', '#666666');
                }
              }
              
              // 3. Present students
              if ((obs.amount !== undefined && obs.amount !== null) && yPos < maxCellY - 8) {
                yPos += 1; // Reduced from 2
                addText(`Present: ${obs.amount}`, 6.5, 'Helvetica-Bold', '#228B22'); // Reduced from 7 to 6.5
              }
              
              // 4. Remarks (from status field)
              // The frontend saves remarks to the status field, default is 'Active' when no remarks
              let remarksText = '';
              if (obs.status) {
                const statusLower = obs.status.trim().toLowerCase();
                // Filter out default/empty statuses
                if (statusLower && 
                    statusLower !== 'pending' && 
                    statusLower !== 'active' &&
                    statusLower !== 'inactive' &&
                    statusLower !== 'completed') {
                  remarksText = obs.status.trim();
                }
              }
              
              this.logger.log(`  Remarks check:`);
              this.logger.log(`    Raw status: "${obs.status}"`);
              this.logger.log(`    Processed remarks: "${remarksText}"`);
              this.logger.log(`    yPos: ${yPos}, maxCellY: ${maxCellY}, space available: ${maxCellY - yPos}`);
              
              if (remarksText && remarksText.length > 0) {
                const spaceNeeded = 10; // Reduced from 12 to 10
                if (yPos < maxCellY - spaceNeeded) {
                  yPos += 2;
                  
                  // Separator line
                  doc.strokeColor('#CCCCCC').lineWidth(0.3);
                  doc.moveTo(cellX + 8, yPos).lineTo(cellX + innerCellWidth - 8, yPos).stroke();
                  yPos += 2;
                  
                  addText('Remarks:', 5.5, 'Helvetica-Bold', '#666666', { lineBreak: false }); // Reduced from 6 to 5.5
                  addText(remarksText, 5.5, 'Helvetica', '#333333'); // Reduced from 6 to 5.5
                  this.logger.log(`    ✓ Remarks displayed successfully`);
                } else {
                  this.logger.log(`    ✗ Not enough space (need ${spaceNeeded}px, have ${maxCellY - yPos}px)`);
                }
              } else {
                this.logger.log(`    ✗ No valid remarks to display`);
              }
            } else {
              // Empty cell - center align dash
              doc.fontSize(8).font('Helvetica').fillColor('#CCCCCC');
              doc.text('-', 50 + colWidth * (slotIndex + 1), currentY + cellHeight / 2 - 4, {
                width: colWidth,
                align: 'center',
                lineBreak: false
              });
            }
          });
          
          currentY += cellHeight;
        });
        
        return currentY;
      };

      // Create Labs table
      let currentY = doc.y;
      currentY = createTable('LABS', labs, allLabRooms, labSlots, currentY);
      
      // Add page break if needed
      if (currentY > doc.page.height - 150) {
        doc.addPage();
        currentY = 50;
      } else {
        currentY += 20;
      }
      
      // Create Lectures table
      createTable('LECTURES', classes, allClassRooms, lectureSlots, currentY);
      
      doc.end();
    });
  }

  // Manual trigger endpoint (for testing)
  async sendManualReport(targetEmail: string) {
    try {
      console.log('\n\n========================================');
      console.log('MANUAL REPORT GENERATION STARTED');
      console.log('========================================\n');
      
      const today = new Date();
      const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
      const currentTime = today.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      this.logger.log(`Sending manual report to: ${targetEmail}`);
      console.log(`Day of week: ${dayOfWeek}`);

      const observations = await this.slotService.findAll();
      
      // Log all observations with their status
      this.logger.log(`Total observations fetched: ${observations.length}`);
      console.log('\n=== ALL OBSERVATIONS IN DATABASE ===');
      observations.forEach((obs, index) => {
        console.log(`\n[${index + 1}] ID: ${obs.id}`);
        console.log(`    SlotName: "${obs.slotName}"`);
        console.log(`    Location: "${obs.location}"`);
        console.log(`    Amount: ${obs.amount}`);
        console.log(`    Status (REMARKS): "${obs.status}"`);
        console.log(`    Notes (Schedule): "${obs.notes}"`);
        console.log(`    UpdatedAt: ${obs.updatedAt}`);
      });
      console.log('\n=== END ALL OBSERVATIONS ===\n');
      
      // Filter for today's day of week (not creation date)
      // This shows the timetable for today (Saturday, Monday, etc.) with current attendance
      const todayObservations = observations.filter(obs => {
        if (!obs.slotName) return false;
        const matches = obs.slotName.toLowerCase().includes(dayOfWeek.toLowerCase());
        console.log(`Checking "${obs.slotName}" for "${dayOfWeek}": ${matches ? 'MATCH' : 'no match'}`);
        return matches;
      });

      console.log(`\n=== FILTERED FOR ${dayOfWeek.toUpperCase()} ===`);
      console.log(`Found ${todayObservations.length} observations for ${dayOfWeek}\n`);
      todayObservations.forEach((obs, index) => {
        console.log(`[${index + 1}] ${obs.slotName}`);
        console.log(`    Location: ${obs.location}, Amount: ${obs.amount}`);
        console.log(`    Status (Remarks): "${obs.status}"`);
        console.log(`    Notes (Schedule): "${obs.notes}"`);
      });
      console.log('=== END FILTERED ===\n');

      const pdfBuffer = await this.generatePDF(
        todayObservations, 
        currentTime, 
        dayOfWeek, 
        'Manual Report'
      );

      this.logger.log('PDF generated successfully');

      const mailOptions = {
        from: process.env.EMAIL_USER || 'your-email@gmail.com',
        to: targetEmail,
        subject: `Manual Attendance Report - ${dayOfWeek} ${currentTime}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f6f8fc; border-radius: 10px;">
            <h2 style="color: #1e293b;">Attendance Report</h2>
            <p style="color: #64748b;">This is a manually triggered report.</p>
            <p style="color: #64748b;"><strong>Total Observations:</strong> ${todayObservations.length}</p>
          </div>
        `,
        attachments: [
          {
            filename: `manual-attendance-report-${Date.now()}.pdf`,
            content: pdfBuffer,
          },
        ],
      };

      this.logger.log('Sending email...');
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log('Email sent successfully!');
      this.logger.log(`Message ID: ${info.messageId}`);
      this.logger.log(`Response: ${info.response}`);
      
      return { success: true, message: 'Manual report sent successfully', messageId: info.messageId };
    } catch (error) {
      this.logger.error(`Failed to send manual report: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
      if (error.code) {
        this.logger.error(`Error code: ${error.code}`);
      }
      if (error.command) {
        this.logger.error(`SMTP command: ${error.command}`);
      }
      if (error.response) {
        this.logger.error(`SMTP response: ${error.response}`);
      }
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }
}
