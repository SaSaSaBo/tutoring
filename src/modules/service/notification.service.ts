import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationService {
  notify: any;
  
  // Anlık bildirim gönderme servisi
  async sendPushNotification(deviceId: string, title: string, message: string): Promise<void> {
    // Burada anlık bildirim gönderme işlemi yapılır
    console.log(`Push notification sent to device ${deviceId} with title "${title}" and message: ${message}`);
    // Aslında bu noktada bir push notification servisi ile işlem yapmanız gerekecek
  }
}
