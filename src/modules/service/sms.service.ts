import { Injectable } from "@nestjs/common";

@Injectable()
export class SmsService {

  async sendActivationCode(phone: string, code: string) {
    // Burada SMS gönderim işlemi yapılmalıdır.
    console.log(`Activation code sent to ${phone}: ${code}`);
    return { message: `Activation code sent to ${phone}` };
  }
}
