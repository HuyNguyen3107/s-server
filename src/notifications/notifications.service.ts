import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface Notification {
  id: string;
  type: 'new-order' | 'order-status-update' | 'new-consultation' | 'other';
  title: string;
  message: string;
  data: any;
  timestamp: string;
  read: boolean;
  assignedTo?: {
    userId: string;
    userName: string;
  } | null;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly notificationsDir = path.join(
    process.cwd(),
    'data',
    'notifications',
  );
  private readonly notificationsFile = path.join(
    this.notificationsDir,
    'notifications.json',
  );

  constructor() {
    this.ensureDirectoryExists();
    this.ensureFileExists();
  }

  private ensureDirectoryExists() {
    if (!fs.existsSync(this.notificationsDir)) {
      fs.mkdirSync(this.notificationsDir, { recursive: true });
      this.logger.log(
        `Created notifications directory: ${this.notificationsDir}`,
      );
    }
  }

  private ensureFileExists() {
    if (!fs.existsSync(this.notificationsFile)) {
      fs.writeFileSync(this.notificationsFile, JSON.stringify([], null, 2));
      this.logger.log(`Created notifications file: ${this.notificationsFile}`);
    }
  }

  private readNotifications(): Notification[] {
    try {
      const data = fs.readFileSync(this.notificationsFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      this.logger.error('Error reading notifications file:', error);
      return [];
    }
  }

  private writeNotifications(notifications: Notification[]) {
    try {
      fs.writeFileSync(
        this.notificationsFile,
        JSON.stringify(notifications, null, 2),
      );
    } catch (error) {
      this.logger.error('Error writing notifications file:', error);
    }
  }

  // Create a new notification
  createNotification(
    type: Notification['type'],
    title: string,
    message: string,
    data: any,
  ): Notification {
    const notifications = this.readNotifications();

    // Deduplication: prevent duplicates within short time window
    const now = Date.now();
    const windowMs = 30 * 1000; // 30 seconds
    const key = this.buildFingerprint(type, data, message);

    const existing = notifications.find((n) => {
      const ts = new Date(n.timestamp).getTime();
      return (
        n.type === type &&
        this.buildFingerprint(n.type, n.data, n.message) === key &&
        now - ts <= windowMs
      );
    });

    if (existing) {
      this.logger.warn(
        `Duplicate notification suppressed for key=${key} within ${windowMs}ms`,
      );
      return existing;
    }

    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      type,
      title,
      message,
      data,
      timestamp: new Date().toISOString(),
      read: false,
    };

    notifications.unshift(notification);

    if (notifications.length > 100) {
      notifications.splice(100);
    }

    this.writeNotifications(notifications);
    this.logger.log(`Created notification: ${notification.id}`);

    return notification;
  }

  private buildFingerprint(
    type: Notification['type'],
    data: any,
    message: string,
  ): string {
    // Prefer stable identifiers if present
    const idLike =
      data?.consultationId || data?.orderId || data?.orderCode || data?.id || '';
    const phone = data?.phoneNumber || '';
    return `${type}|${idLike}|${phone}|${message}`;
  }

  // Get all notifications
  getAllNotifications(): Notification[] {
    return this.readNotifications();
  }

  // Get unread notifications
  getUnreadNotifications(): Notification[] {
    return this.readNotifications().filter((n) => !n.read);
  }

  // Mark notification as read
  markAsRead(notificationId: string): boolean {
    const notifications = this.readNotifications();
    const notification = notifications.find((n) => n.id === notificationId);

    if (notification) {
      notification.read = true;
      this.writeNotifications(notifications);
      this.logger.log(`Marked notification as read: ${notificationId}`);
      return true;
    }

    return false;
  }

  // Mark all notifications as read
  markAllAsRead(): number {
    const notifications = this.readNotifications();
    let count = 0;

    notifications.forEach((n) => {
      if (!n.read) {
        n.read = true;
        count++;
      }
    });

    this.writeNotifications(notifications);
    this.logger.log(`Marked ${count} notifications as read`);

    return count;
  }

  // Delete a notification
  deleteNotification(notificationId: string): boolean {
    const notifications = this.readNotifications();
    const index = notifications.findIndex((n) => n.id === notificationId);

    if (index !== -1) {
      notifications.splice(index, 1);
      this.writeNotifications(notifications);
      this.logger.log(`Deleted notification: ${notificationId}`);
      return true;
    }

    return false;
  }

  // Clear all notifications
  clearAllNotifications(): number {
    const notifications = this.readNotifications();
    const count = notifications.length;
    this.writeNotifications([]);
    this.logger.log(`Cleared all ${count} notifications`);
    return count;
  }

  // Delete old notifications (older than X days)
  deleteOldNotifications(daysOld: number = 30): number {
    const notifications = this.readNotifications();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const filtered = notifications.filter((n) => {
      const notifDate = new Date(n.timestamp);
      return notifDate > cutoffDate;
    });

    const deletedCount = notifications.length - filtered.length;
    this.writeNotifications(filtered);
    this.logger.log(`Deleted ${deletedCount} old notifications`);

    return deletedCount;
  }

  // Update notification assignee (when order is assigned/unassigned)
  updateNotificationAssignee(
    orderId: string,
    userId: string | null,
    userName: string | null,
  ): boolean {
    const notifications = this.readNotifications();
    let updated = false;

    notifications.forEach((n) => {
      // Find notification by order ID in data
      if (
        n.type === 'new-order' &&
        (n.data?.id === orderId || n.data?.orderId === orderId)
      ) {
        if (userId && userName) {
          n.assignedTo = { userId, userName };
        } else {
          n.assignedTo = null;
        }
        updated = true;
      }
    });

    if (updated) {
      this.writeNotifications(notifications);
      this.logger.log(
        `Updated assignee for order ${orderId}: ${userName || 'unassigned'}`,
      );
    }

    return updated;
  }
}
