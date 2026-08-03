import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

let resend;

export const connectMailServer = () => {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }
    resend = new Resend(process.env.RESEND_API_KEY);

    console.log("✅ Mail server connected");
  } catch (error) {
    console.error("❌ Mail server connection failed:", error);
    process.exit(1);
  }
};

export const sendEmail = async ({ email, subject, message }) => {
  if (!resend) {
    throw new Error("Mail server not connected");
  }
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply <noreply@crixchange.in>",
      to: email,
      subject,
      html: message
    });

    if (error) {
      throw new Error(error.message || "Failed to send email via Resend");
    }

    return data;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
};