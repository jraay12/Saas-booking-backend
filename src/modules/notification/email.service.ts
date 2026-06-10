import { mailTransporter } from "../../lib/mailTransporter";

export interface SendEmailDTO {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
   async sendEmail({ to, subject, html }: SendEmailDTO) {
    if (!to || !subject || !html) {
      throw new Error("Missing email fields");
    }

    const info = await mailTransporter.sendMail({
      from: `"No Reply" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    return {
      messageId: info.messageId,
      accepted: info.accepted,
    };
  }
}
