import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

let transporter;

export const connectMailServer =  () => {
  try {
    transporter = nodemailer.createTransport({
     service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
    });

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
