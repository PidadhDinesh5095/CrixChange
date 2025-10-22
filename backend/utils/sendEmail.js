import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send email function
export const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      html: options.message
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

// Email templates
export const emailTemplates = {
  welcome: (name) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #2563eb, #8b5cf6); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Welcome to CrixChange!</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <h2 style="color: #1f2937;">Hello ${name},</h2>
        <p style="color: #4b5563; line-height: 1.6;">
          Welcome to CrixChange, India's premier fantasy sports stock exchange platform! 
          We're excited to have you join our community of traders.
        </p>
        <p style="color: #4b5563; line-height: 1.6;">
          To get started, please verify your email address and complete your KYC verification 
          to unlock all trading features.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/dashboard" 
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Get Started
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          If you have any questions, feel free to contact our support team.
        </p>
      </div>
    </div>
  `,

  emailVerification: (name, verificationUrl) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #2563eb, #8b5cf6); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Verify Your Email</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <h2 style="color: #1f2937;">Hello ${name},</h2>
        <p style="color: #4b5563; line-height: 1.6;">
          Please click the button below to verify your email address and activate your CrixChange account.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          This link will expire in 24 hours. If you didn't create this account, please ignore this email.
        </p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${verificationUrl}" style="color: #2563eb;">${verificationUrl}</a>
        </p>
      </div>
    </div>
  `,

  passwordReset: (name, resetUrl) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #ef4444, #f59e0b); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Password Reset Request</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <h2 style="color: #1f2937;">Hello ${name},</h2>
        <p style="color: #4b5563; line-height: 1.6;">
          You have requested a password reset for your CrixChange account. 
          Click the button below to reset your password.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          This link will expire in 10 minutes. If you didn't request this reset, please ignore this email.
        </p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${resetUrl}" style="color: #ef4444;">${resetUrl}</a>
        </p>
      </div>
    </div>
  `,

  kycApproved: (name) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">KYC Approved! 🎉</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <h2 style="color: #1f2937;">Congratulations ${name}!</h2>
        <p style="color: #4b5563; line-height: 1.6;">
          Your KYC verification has been successfully approved. You can now access all trading features 
          on CrixChange and start building your sports stock portfolio.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/trading" 
             style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Start Trading
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          Happy trading! Remember to trade responsibly and manage your risk.
        </p>
      </div>
    </div>
  `,

  kycRejected: (name, reason) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">KYC Review Required</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <h2 style="color: #1f2937;">Hello ${name},</h2>
        <p style="color: #4b5563; line-height: 1.6;">
          We've reviewed your KYC application and need some additional information or corrections.
        </p>
        <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
          <p style="color: #991b1b; margin: 0;"><strong>Reason:</strong> ${reason}</p>
        </div>
        <p style="color: #4b5563; line-height: 1.6;">
          Please review the feedback and resubmit your KYC application with the necessary corrections.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/kyc" 
             style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Update KYC
          </a>
        </div>
      </div>
    </div>
  `,

  tradeConfirmation: (name, tradeDetails) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Trade Confirmation</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <h2 style="color: #1f2937;">Hello ${name},</h2>
        <p style="color: #4b5563; line-height: 1.6;">
          Your trade has been successfully executed. Here are the details:
        </p>
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Trade Type:</td>
              <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${tradeDetails.type.toUpperCase()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Team:</td>
              <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${tradeDetails.team}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Quantity:</td>
              <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${tradeDetails.quantity}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Price:</td>
              <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">₹${tradeDetails.price}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Total Amount:</td>
              <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">₹${tradeDetails.totalAmount}</td>
            </tr>
          </table>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/portfolio" 
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Portfolio
          </a>
        </div>
      </div>
    </div>
  `,

  depositConfirmation: (name, amount, method) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Deposit Successful</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <h2 style="color: #1f2937;">Hello ${name},</h2>
        <p style="color: #4b5563; line-height: 1.6;">
          Your deposit has been successfully processed and added to your wallet.
        </p>
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
          <h3 style="color: #10b981; margin: 0 0 10px 0;">₹${amount}</h3>
          <p style="color: #6b7280; margin: 0;">Deposited via ${method}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/wallet" 
             style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Wallet
          </a>
        </div>
      </div>
    </div>
  `,

  withdrawalConfirmation: (name, amount, status) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Withdrawal ${status === 'completed' ? 'Completed' : 'Initiated'}</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <h2 style="color: #1f2937;">Hello ${name},</h2>
        <p style="color: #4b5563; line-height: 1.6;">
          ${status === 'completed' 
            ? 'Your withdrawal has been successfully processed and transferred to your bank account.'
            : 'Your withdrawal request has been received and is being processed.'
          }
        </p>
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
          <h3 style="color: #f59e0b; margin: 0 0 10px 0;">₹${amount}</h3>
          <p style="color: #6b7280; margin: 0;">
            ${status === 'completed' ? 'Transferred to your bank account' : 'Processing time: 1-2 business days'}
          </p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/wallet" 
             style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Transaction History
          </a>
        </div>
      </div>
    </div>
  `
};

// Send welcome email
export const sendWelcomeEmail = async (email, name) => {
  await sendEmail({
    email,
    subject: 'Welcome to CrixChange - Start Your Trading Journey!',
    message: emailTemplates.welcome(name)
  });
};

// Send email verification
export const sendVerificationEmail = async (email, name, verificationUrl) => {
  await sendEmail({
    email,
    subject: 'Verify Your Email Address - CrixChange',
    message: emailTemplates.emailVerification(name, verificationUrl)
  });
};

// Send password reset email
export const sendPasswordResetEmail = async (email, name, resetUrl) => {
  await sendEmail({
    email,
    subject: 'Password Reset Request - CrixChange',
    message: emailTemplates.passwordReset(name, resetUrl)
  });
};

// Send KYC approval email
export const sendKYCApprovalEmail = async (email, name) => {
  await sendEmail({
    email,
    subject: 'KYC Approved - Start Trading on CrixChange!',
    message: emailTemplates.kycApproved(name)
  });
};

// Send KYC rejection email
export const sendKYCRejectionEmail = async (email, name, reason) => {
  await sendEmail({
    email,
    subject: 'KYC Review Required - CrixChange',
    message: emailTemplates.kycRejected(name, reason)
  });
};

// Send trade confirmation email
export const sendTradeConfirmationEmail = async (email, name, tradeDetails) => {
  await sendEmail({
    email,
    subject: `Trade Confirmation - ${tradeDetails.type.toUpperCase()} ${tradeDetails.team}`,
    message: emailTemplates.tradeConfirmation(name, tradeDetails)
  });
};

// Send deposit confirmation email
export const sendDepositConfirmationEmail = async (email, name, amount, method) => {
  await sendEmail({
    email,
    subject: 'Deposit Successful - CrixChange',
    message: emailTemplates.depositConfirmation(name, amount, method)
  });
};

// Send withdrawal confirmation email
export const sendWithdrawalConfirmationEmail = async (email, name, amount, status) => {
  await sendEmail({
    email,
    subject: `Withdrawal ${status === 'completed' ? 'Completed' : 'Initiated'} - CrixChange`,
    message: emailTemplates.withdrawalConfirmation(name, amount, status)
  });
};