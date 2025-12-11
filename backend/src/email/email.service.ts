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
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-app-password',
      },
    });
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
      throw error;
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
        const cellHeight = 90;
        const numCols = slots.length + 1;
        const colWidth = pageWidth / numCols;
        const cellPadding = 8;
        
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
            const cellWidth = colWidth - (2 * cellPadding);
            
            const roomObs = items.filter(obs => 
              obs.location && obs.location.includes(room) && matchSlot(obs, slot)
            );
            
            if (roomObs.length > 0) {
              const obs = roomObs[0];
              
              // Debug: Log the observation data
              this.logger.log(`Cell data - Slot: ${obs.slotName}, Amount: ${obs.amount}, Notes: ${obs.notes}, Status: ${obs.status}`);
              
              let yPos = currentY + cellPadding;
              
              // 1. Slot name (clean format)
              let slotName = obs.slotName || '';
              slotName = slotName.replace(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*-\s*/i, '');
              
              doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#000000');
              doc.text(slotName, cellX, yPos, { 
                width: cellWidth, 
                align: 'center',
                lineBreak: false
              });
              yPos += 13;
              
              // 2. Faculty name(s) - Parse from notes field
              if (obs.notes) {
                const noteParts = obs.notes.split(' | ');
                const facultyPart = noteParts.find(p => p.startsWith('Faculty:'));
                const faculty2Part = noteParts.find(p => p.startsWith('Faculty2:'));
                
                if (facultyPart) {
                  const facultyName = facultyPart.replace('Faculty: ', '');
                  doc.fontSize(7).font('Helvetica').fillColor('#0066cc');
                  doc.text(`Faculty: ${facultyName}`, cellX, yPos, { 
                    width: cellWidth, 
                    align: 'center',
                    lineBreak: false
                  });
                  yPos += 11;
                }
                
                // Show Faculty2 for dual batch labs (638/515)
                if (faculty2Part) {
                  const faculty2Name = faculty2Part.replace('Faculty2: ', '');
                  doc.fontSize(7).font('Helvetica').fillColor('#0066cc');
                  doc.text(`Faculty 2: ${faculty2Name}`, cellX, yPos, { 
                    width: cellWidth, 
                    align: 'center',
                    lineBreak: false
                  });
                  yPos += 11;
                }
              }
              
              // 3. Present students count
              if (obs.amount !== undefined && obs.amount !== null) {
                doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#0066cc');
                doc.text(`Present: ${obs.amount}`, cellX, yPos, { 
                  width: cellWidth, 
                  align: 'center',
                  lineBreak: false
                });
                yPos += 13;
              }
              
              // 4. Remarks section - use STATUS field (not notes)
              // The frontend saves remarks to the status field
              const remarksText = obs.status && obs.status.trim() && obs.status !== 'pending' && obs.status !== 'Active' 
                ? obs.status.trim() 
                : '';
              
              this.logger.log(`Remarks text to display: "${remarksText}"`);
              
              if (remarksText && remarksText.length > 0) {
                // Separator line
                doc.strokeColor('#999999').lineWidth(0.5);
                doc.moveTo(cellX + 6, yPos).lineTo(cellX + cellWidth - 6, yPos).stroke();
                yPos += 5;
                
                // Calculate available height for remarks
                const maxRemarksHeight = (currentY + cellHeight - cellPadding - 2) - yPos;
                
                // Remarks text - larger font for better visibility
                doc.fontSize(6.5).font('Helvetica').fillColor('#333333');
                
                // Create text box with proper wrapping
                doc.text(remarksText, cellX + 4, yPos, { 
                  width: cellWidth - 8, 
                  align: 'left',
                  lineBreak: true,
                  height: maxRemarksHeight,
                  continued: false
                });
                
                this.logger.log(`Remarks displayed in PDF`);
              } else {
                this.logger.log(`No remarks found for this observation`);
              }
            } else {
              // Empty cell with centered dash
              doc.fontSize(18).fillColor('#cccccc');
              doc.text('-', x, currentY + (cellHeight / 2) - 9, { 
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

      // Create LABS table with lab sessions (2-hour slots)
      let currentY = createTable('LABS', labs, allLabRooms, labSlots, doc.y);
      doc.moveDown(1.5);
      
      // Check if we need a new page
      if (doc.y > 600) {
        doc.addPage();
        currentY = 40;
      }
      
      // Create LECTURES table with individual slots (1-hour slots)
      createTable('LECTURES (Classes)', classes, allClassRooms, lectureSlots, doc.y);
      
      // Footer
      doc.fontSize(8).fillColor('#666666');
      doc.text(
        `Page 1 of 1`,
        50,
        doc.page.height - 50,
        { width: pageWidth, align: 'center' }
      );

      doc.end();
    });
  }

  // Manual trigger endpoint (for testing)
  async sendManualReport(targetEmail: string) {
    try {
      const today = new Date();
      const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
      const currentTime = today.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      this.logger.log(`Sending manual report to: ${targetEmail}`);

      const observations = await this.slotService.findAll();
      
      // Log all observations with their notes
      this.logger.log(`Total observations fetched: ${observations.length}`);
      observations.forEach((obs, index) => {
        this.logger.log(`Observation ${index + 1}: ID=${obs.id}, Slot=${obs.slotName}, Location=${obs.location}, Amount=${obs.amount}, Notes="${obs.notes || 'EMPTY'}"`);
      });
      
      const todayObservations = observations.filter(obs => {
        const obsDate = new Date(obs.createdAt);
        return obsDate.toDateString() === today.toDateString();
      });

      this.logger.log(`Found ${todayObservations.length} observations for today`);
      todayObservations.forEach((obs, index) => {
        this.logger.log(`Today's observation ${index + 1}: Slot=${obs.slotName}, Notes="${obs.notes || 'NO REMARKS'}"`);
      });

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
      await this.transporter.sendMail(mailOptions);
      this.logger.log('Email sent successfully!');
      
      return { success: true, message: 'Manual report sent successfully' };
    } catch (error) {
      this.logger.error(`Failed to send manual report: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }
}
