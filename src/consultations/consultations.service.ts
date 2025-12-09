import { Injectable } from '@nestjs/common';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { Consultation } from './interfaces/consultation.interface';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class ConsultationsService {
  constructor(private readonly notificationsGateway: NotificationsGateway) {}
  private readonly dataPath = path.join(
    process.cwd(),
    'data',
    'consultations',
    'consultations.json',
  );
  private readonly notificationsPath = path.join(
    process.cwd(),
    'data',
    'notifications',
    'notifications.json',
  );

  private lastOp = Promise.resolve();

  private runSerialized<T>(op: () => Promise<T>): Promise<T> {
    const p = this.lastOp.then(op);
    this.lastOp = p.then(() => undefined).catch(() => undefined);
    return p;
  }

  async create(
    createConsultationDto: CreateConsultationDto,
  ): Promise<Consultation> {
    return this.runSerialized(async () => {
      const id = `consult_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const newConsultation: Consultation = {
        id,
        customerName: createConsultationDto.customerName,
        phoneNumber: createConsultationDto.phoneNumber,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const consultations = await this.readConsultations();
      consultations.unshift(newConsultation);
      await this.writeConsultations(consultations);
      this.notificationsGateway.emitNewConsultation({
        id: newConsultation.id,
        customerName: newConsultation.customerName,
        phoneNumber: newConsultation.phoneNumber,
        status: newConsultation.status,
        createdAt: newConsultation.createdAt,
      });
      return newConsultation;
    });
  }

  async findAll(): Promise<Consultation[]> {
    return await this.readConsultations();
  }

  async findByAssignee(userId: string): Promise<Consultation[]> {
    const consultations = await this.readConsultations();
    return consultations.filter(
      (c) => c.assignedTo && c.assignedTo.userId === userId,
    );
  }

  async findOne(id: string): Promise<Consultation | null> {
    const consultations = await this.readConsultations();
    return consultations.find((c) => c.id === id) || null;
  }

  async assignToUser(
    id: string,
    userId: string,
    userName: string,
  ): Promise<Consultation | null> {
    return this.runSerialized(async () => {
      const consultations = await this.readConsultations();
      const index = consultations.findIndex((c) => c.id === id);
      if (index === -1) {
        return null;
      }
      consultations[index].assignedTo = { userId, userName };
      consultations[index].status = 'contacted';
      consultations[index].updatedAt = new Date().toISOString();
      await this.writeConsultations(consultations);
      await this.updateNotificationAssignment(id, userId, userName);
      return consultations[index];
    });
  }

  async updateStatus(
    id: string,
    status: Consultation['status'],
    notes?: string,
  ): Promise<Consultation | null> {
    return this.runSerialized(async () => {
      const consultations = await this.readConsultations();
      const index = consultations.findIndex((c) => c.id === id);
      if (index === -1) {
        return null;
      }
      consultations[index].status = status;
      consultations[index].updatedAt = new Date().toISOString();
      if (notes) {
        consultations[index].notes = notes;
      }
      await this.writeConsultations(consultations);
      return consultations[index];
    });
  }

  async remove(id: string): Promise<boolean> {
    return this.runSerialized(async () => {
      const consultations = await this.readConsultations();
      const filteredConsultations = consultations.filter((c) => c.id !== id);
      if (filteredConsultations.length === consultations.length) {
        return false;
      }
      await this.writeConsultations(filteredConsultations);
      return true;
    });
  }

  private async readConsultations(): Promise<Consultation[]> {
    try {
      const data = await fs.readFile(this.dataPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // If file doesn't exist or is empty, return empty array
      return [];
    }
  }

  private async writeConsultations(
    consultations: Consultation[],
  ): Promise<void> {
    await fs.writeFile(
      this.dataPath,
      JSON.stringify(consultations, null, 2),
      'utf-8',
    );
  }

  private async createNotification(consultation: Consultation): Promise<void> {
    try {
      const notifications = await this.readNotifications();

      const notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type: 'new-consultation',
        title: 'Yêu cầu tư vấn mới',
        message: `${consultation.customerName} đã yêu cầu tư vấn`,
        data: {
          consultationId: consultation.id,
          customerName: consultation.customerName,
          phoneNumber: consultation.phoneNumber,
          createdAt: consultation.createdAt,
        },
        timestamp: new Date().toISOString(),
        read: false,
      };

      notifications.unshift(notification);
      await this.writeNotifications(notifications);
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  private async readNotifications(): Promise<any[]> {
    try {
      const data = await fs.readFile(this.notificationsPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  private async writeNotifications(notifications: any[]): Promise<void> {
    await fs.writeFile(
      this.notificationsPath,
      JSON.stringify(notifications, null, 2),
      'utf-8',
    );
  }

  private async updateNotificationAssignment(
    consultationId: string,
    userId: string,
    userName: string,
  ): Promise<void> {
    try {
      const notifications = await this.readNotifications();
      const notifIndex = notifications.findIndex(
        (n) =>
          n.type === 'new-consultation' &&
          n.data?.consultationId === consultationId,
      );

      if (notifIndex !== -1) {
        notifications[notifIndex].assignedTo = { userId, userName };
        await this.writeNotifications(notifications);
      }
    } catch (error) {
      console.error('Error updating notification assignment:', error);
    }
  }
}
