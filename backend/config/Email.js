import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

let transporter;

export const connectMailServer = async () => {
  try {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.verify();

    console.log("✅ Mail server connected");
  } catch (error) {
    console.error("❌ Mail server connection failed:", error);
    process.exit(1);
  }
};

export const sendEmail = async ({ email, subject, message }) => {
  if (!transporter) {
    throw new Error("Mail server not connected");
  }

  const info = await transporter.sendMail({
    from: `"CrixChange" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html: message
  });

  return info;
};