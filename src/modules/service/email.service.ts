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

    async sendPasswordResetEmail(to: string, token: string) {
        const resetLink = "http://localhost:3001/reset-password?token=" + token;
        const mailOptions = {
            from: 'german.hoppe@ethereal.email',
            to,
            subject: 'Activate your mail',
            text: 'Your activation link:',
            html: `<a href="${resetLink}">Activate Link</a>`
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log("Activation link sented to your email.", info.messageId);
            return { message: "Activation link sented to your email." };
        } catch (error) {
            throw new Error("There been error while sending activation link. " + error.message);
        }
    }
}