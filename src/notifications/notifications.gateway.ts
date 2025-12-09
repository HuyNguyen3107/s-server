import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@WebSocketGateway({
  cors: {
    origin: true, // Accept all origins in development
    credentials: true,
  },
  namespace: 'notifications',
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('NotificationsGateway');
  private adminClients: Set<string> = new Set();

  constructor(private readonly notificationsService: NotificationsService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.adminClients.delete(client.id);
  }

  @SubscribeMessage('join-admin')
  handleJoinAdmin(client: Socket, payload: any) {
    this.adminClients.add(client.id);
    this.logger.log(`Admin client joined: ${client.id}`);

    // Send all existing notifications to the newly joined admin
    const notifications = this.notificationsService.getAllNotifications();
    client.emit('notifications-history', notifications);
    this.logger.log(
      `Sent ${notifications.length} notifications to admin: ${client.id}`,
    );

    client.emit('joined-admin', { success: true });
  }

  @SubscribeMessage('leave-admin')
  handleLeaveAdmin(client: Socket) {
    this.adminClients.delete(client.id);
    this.logger.log(`Admin client left: ${client.id}`);
  }

  // Method to emit new order notification to all admin clients
  emitNewOrder(orderData: any) {
    this.logger.log(
      `🔔 Emitting new order notification to ${this.adminClients.size} admin(s)`,
    );
    this.logger.log(`Order data: ${JSON.stringify(orderData)}`);

    // Create and save notification
    const notification = this.notificationsService.createNotification(
      'new-order',
      'Đơn hàng mới',
      `Đơn hàng ${orderData.orderCode} đã được tạo`,
      orderData,
    );

    // Emit to all admin clients (single path to avoid duplicate events)
    this.adminClients.forEach((clientId) => {
      this.logger.log(`Sending to admin client: ${clientId}`);
      this.server.to(clientId).emit('new-order', notification);
    });
  }

  // Method to emit order status update
  emitOrderStatusUpdate(orderData: any) {
    this.logger.log('Emitting order status update');

    // Create and save notification
    const notification = this.notificationsService.createNotification(
      'order-status-update',
      'Cập nhật đơn hàng',
      `Đơn hàng ${orderData.orderCode} đã được cập nhật`,
      orderData,
    );

    this.server.emit('order-status-updated', notification);
  }

  // Handle mark notification as read
  @SubscribeMessage('mark-notification-read')
  handleMarkAsRead(client: Socket, notificationId: string) {
    const success = this.notificationsService.markAsRead(notificationId);
    client.emit('notification-marked-read', { notificationId, success });
  }

  // Handle mark all notifications as read
  @SubscribeMessage('mark-all-notifications-read')
  handleMarkAllAsRead(client: Socket) {
    const count = this.notificationsService.markAllAsRead();
    client.emit('all-notifications-marked-read', { count });
  }

  // Handle delete notification
  @SubscribeMessage('delete-notification')
  handleDeleteNotification(client: Socket, notificationId: string) {
    const success =
      this.notificationsService.deleteNotification(notificationId);
    client.emit('notification-deleted', { notificationId, success });
  }

  // Handle clear all notifications
  @SubscribeMessage('clear-all-notifications')
  handleClearAll(client: Socket) {
    const count = this.notificationsService.clearAllNotifications();
    client.emit('all-notifications-cleared', { count });
  }

  // Handle get all notifications
  @SubscribeMessage('get-all-notifications')
  handleGetAll(client: Socket) {
    const notifications = this.notificationsService.getAllNotifications();
    client.emit('all-notifications', notifications);
  }

  // Handle get unread notifications
  @SubscribeMessage('get-unread-notifications')
  handleGetUnread(client: Socket) {
    const notifications = this.notificationsService.getUnreadNotifications();
    client.emit('unread-notifications', notifications);
  }

  // ⭐ Emit order assigned event
  emitOrderAssigned(data: {
    orderId: string;
    orderCode: string;
    assignedTo: { userId: string; userName: string };
  }) {
    this.logger.log(
      `📋 Order ${data.orderCode} assigned to ${data.assignedTo.userName}`,
    );

    // Broadcast to all admin clients
    this.server.emit('order-assigned', data);
  }

  // ⭐ Emit new consultation notification
  emitNewConsultation(consultationData: any) {
    this.logger.log(
      `🔔 Emitting new consultation notification to ${this.adminClients.size} admin(s)`,
    );
    this.logger.log(`Consultation data: ${JSON.stringify(consultationData)}`);

    // Create and save notification
    const notification = this.notificationsService.createNotification(
      'new-consultation',
      'Yêu cầu tư vấn mới',
      `${consultationData.customerName} đã yêu cầu tư vấn`,
      consultationData,
    );

    // Emit to all admin clients (single path to avoid duplicate events)
    this.adminClients.forEach((clientId) => {
      this.logger.log(`Sending consultation to admin client: ${clientId}`);
      this.server.to(clientId).emit('new-consultation', notification);
    });
  }
}
