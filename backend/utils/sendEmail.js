

import { sendEmail } from '../config/Email.js';






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
  emailVerificationSuccess: (kycUrl) => `
    <div style="font-family: Raleway, Arial, sans-serif; background: #000; color: #fff; border-radius: 8px; padding: 32px; max-width: 480px; margin: 32px auto; box-shadow: 0 2px 16px rgba(0,0,0,0.12);">
      <h1 style="font-size: 2rem; font-weight: bold; margin-bottom: 16px; color: #fff;">Complete Your KYC</h1>
      <p style="font-size: 1rem; color: #d1d5db; margin-bottom: 24px;">Your email has been verified successfully! To access all features, please complete your KYC by clicking the button below:</p>
      <a href="${kycUrl}" style="display: inline-block; padding: 12px 32px; background: #fff; color: #000; font-weight: bold; font-size: 1rem; border-radius: 6px; text-decoration: none; box-shadow: 0 2px 8px rgba(0,0,0,0.10); margin-bottom: 24px; transition: background 0.2s;">
        Complete KYC
      </a>
      <p style="font-size: 0.95rem; color: #d1d5db; margin-top: 16px;">KYC is required for trading and withdrawals.</p>
      <div style="margin-top:32px; text-align:center;">
        <span style="font-size: 1.2rem; font-weight: bold; color: #fff;">CRIXCHANGE</span>
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
  passwordChanged: (changePasswordUrl) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

  <!-- Font -->
  <link
    href="https://fonts.googleapis.com/css2?family=Darker+Grotesque:wght@400;500;600;700;800&display=swap"
    rel="stylesheet"
  />

  <style>
    body{
      margin:0;
      padding:24px 12px;
      background:#f3f4f6;
      font-family:'Darker Grotesque','Helvetica Neue',Arial,sans-serif;
    }

    table{
      border-spacing:0;
    }

    .container{
      width:100%;
      max-width:520px;
      margin:auto;
      background:#0b0b0b;
      border-radius:24px;
      overflow:hidden;
      box-shadow:0 10px 40px rgba(0,0,0,0.18);
    }

    .hero{
      background:linear-gradient(135deg,#111827,#000000);
      padding:54px 30px;
      text-align:center;
    }

    .logo{
      font-size:38px;
      font-weight:800;
      color:#ffffff;
      letter-spacing:-1px;
      margin-bottom:24px;
      line-height:1;
    }

    .title{
      margin:0;
      color:#ffffff;
      font-size:40px;
      line-height:42px;
      font-weight:800;
      letter-spacing:-1px;
    }

    .subtitle{
      margin:18px auto 0;
      max-width:360px;
      color:#d1d5db;
      font-size:20px;
      line-height:30px;
      font-weight:500;
    }

    .content{
      padding:38px 30px;
      background:#0b0b0b;
    }

    .text{
      margin:0 0 28px;
      color:#d1d5db;
      font-size:19px;
      line-height:30px;
      font-weight:500;
    }

    .button-wrap{
      text-align:center;
      margin:38px 0;
    }

    .button{
      display:inline-block;
      padding:15px 38px;
      background:#ffffff;
      color:#000000 !important;
      text-decoration:none;
      border-radius:999px;
      font-size:18px;
      font-weight:800;
    }

    .small-text{
      margin:0;
      color:#9ca3af;
      font-size:17px;
      line-height:28px;
    }

    .footer{
      border-top:1px solid rgba(255,255,255,0.08);
      background:#050505;
      padding:28px 20px;
      text-align:center;
    }

    .footer-logo{
      color:#ffffff;
      font-size:28px;
      font-weight:800;
      letter-spacing:-1px;
      line-height:1;
    }

    .footer-text{
      margin:10px 0 0;
      color:#6b7280;
      font-size:15px;
      line-height:24px;
    }

    @media only screen and (max-width:600px){

      .hero{
        padding:46px 22px !important;
      }

      .content{
        padding:32px 22px !important;
      }

      .logo{
        font-size:34px !important;
      }

      .title{
        font-size:34px !important;
        line-height:38px !important;
      }

      .subtitle{
        font-size:18px !important;
        line-height:28px !important;
      }

      .text{
        font-size:18px !important;
        line-height:28px !important;
      }

      .button{
        padding:14px 30px !important;
        font-size:17px !important;
      }

      .footer-logo{
        font-size:25px !important;
      }
    }
  </style>
</head>

<body>

  <table width="100%">
    <tr>
      <td align="center">

        <table class="container" width="520">

          <!-- HERO -->
          <tr>
            <td class="hero">

              <div class="logo">
                Crixchange<span style="color:#ef4444;">.</span>
              </div>

              <h1 class="title">
                Password Changed
              </h1>

              <p class="subtitle">
                Your CRIXCHANGE password was updated successfully.
              </p>

            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td class="content">

              <p class="text">
                If this wasn’t you, secure your account immediately using the button below.
              </p>

              <div class="button-wrap">

                <a href="${changePasswordUrl}" class="button">
                  Secure Account
                </a>

              </div>

              <p class="small-text">
                If you recognize this activity, no further action is required.
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td class="footer">

              <div class="footer-logo">
                Crixchange<span style="color:#ef4444;">.</span>
              </div>

              <p class="footer-text">
                Smart sports trading platform for passionate fans.
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>


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
export const sendEmailVerificationSuccessEmail = async (email, kycUrl) => {
  await sendEmail({
    email,
    subject: 'Email Verified - Complete Your KYC',
    message: emailTemplates.emailVerificationSuccess(kycUrl)
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
export const sendPasswordChangedEmail = async (email, changePasswordUrl) => {
  await sendEmail({
    email,
    subject: 'Your Password Has Been Changed - CrixChange',
    message: emailTemplates.passwordChanged(changePasswordUrl)
  });
}
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
export const sendDepositConfirmationEmail = async (email, name, amount) => {
  await sendEmail({
    email,
    subject: 'Deposit Successful - CrixChange',
    message: emailTemplates.depositConfirmation(name, amount)
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