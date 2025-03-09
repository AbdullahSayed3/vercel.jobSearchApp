import nodemailer from "nodemailer";
import { EventEmitter } from "node:events";

// send email verification
export const SendEmailService = async ({
  to,
  subject,
  html,
  cc="",
  attachments = [],
}) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls:{
          rejectUnauthorized:false
        }
  });

    const info = await transporter.sendMail({
      from: `"Email from Job Search App" <${process.env.EMAIL_USER}>`, // sender address
      to,
      cc,
      subject,
      html,
      attachments,
    });
    console.log("✅ Email sent successfully to:", to);
    return info;
  } catch (error) {
    console.error("❌ Error in sending email", error.message);
    return error;
  }
};

export const EmailEvent = new EventEmitter();

EmailEvent.on("SendEmail", async(...args) => {
  const {to, subject, html, cc="", attachments=[] } = args[0];
    await SendEmailService({
      to,
      subject,
      html,
      cc,
      attachments,
    });
  console.log("Email Sent", to);
});

