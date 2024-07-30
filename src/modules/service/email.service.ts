import { Injectable } from "@nestjs/common";
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {

    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: 'german.hoppe@ethereal.email',
                pass: 'esGp4VqsWSJs3A8tx8'
            }
        });
    }

    async sendActivationEmail(to: string, token: string) {
        const resetLink = "http://localhost:3002/activation-mail?token=" + token;
        const mailOptions = {
            from: '"Tutoring" <no-reply@yourdomain.com>',
            to,
            subject: 'Activate your mail',
            text: 'Your activation link:',
            html: `<a href="${resetLink}">Activate Link</a>`
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log("Activation link sent to your email.", info.messageId);
            return { message: "Activation link sent to your email." };
        } catch (error) {
            throw new Error("There been error while sending activation link. " + error.message);
        }
    }
}