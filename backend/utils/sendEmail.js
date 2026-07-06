

import { sendEmail } from '../config/Email.js';






export const emailTemplates = {
  welcome: (name) => `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

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
      margin:0 0 22px;
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
        Welcome!
      </h1>

      <p class="subtitle">
        Welcome to India's premier fantasy sports stock exchange platform.
      </p>

    </td>
  </tr>

  <!-- CONTENT -->
  <tr>
    <td class="content">

      <p class="text">
        Hello <strong style="color:#ffffff;">${name}</strong>,
      </p>

      <p class="text">
        We're thrilled to welcome you to <strong style="color:#ffffff;">Crixchange</strong>. Your account has been created successfully, and you're now part of a new generation of sports traders.
      </p>

      <p class="text">
        To unlock all platform features, please verify your email address and complete your KYC verification before you begin trading.
      </p>

      <div class="button-wrap">
        <a href="${process.env.FRONTEND_URL}/dashboard" class="button">
          Get Started
        </a>
      </div>

      <p class="small-text">
        Need help getting started? Our support team is always here to assist you.
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

  emailVerification: (name, verificationUrl) => `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

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
      box-shadow:0 10px 40px rgba(0,0,0,.18);
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
      margin:0 0 22px;
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
      margin:0 0 18px;
      color:#9ca3af;
      font-size:17px;
      line-height:28px;
    }

    .link{
      color:#ef4444;
      text-decoration:none;
      word-break:break-all;
      font-weight:600;
    }

    .footer{
      border-top:1px solid rgba(255,255,255,.08);
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
        Verify Email
      </h1>

      <p class="subtitle">
        One last step to activate your Crixchange account.
      </p>

    </td>
  </tr>

  <!-- CONTENT -->
  <tr>
    <td class="content">

      <p class="text">
        Hello <strong style="color:#ffffff;">${name}</strong>,
      </p>

      <p class="text">
        Thanks for joining <strong style="color:#ffffff;">Crixchange</strong>. Please verify your email address to activate your account and access all platform features.
      </p>

      <div class="button-wrap">
        <a href="${verificationUrl}" class="button">
          Verify Email
        </a>
      </div>

      <p class="small-text">
        This verification link will expire in <strong style="color:#ffffff;">24 hours</strong>. If you didn't create a Crixchange account, you can safely ignore this email.
      </p>

      <p class="small-text">
        If the button above doesn't work, copy and paste this link into your browser:
      </p>

      <p class="small-text">
        <a href="${verificationUrl}" class="link">
          ${verificationUrl}
        </a>
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
  emailVerificationSuccess: (kycUrl) => `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

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
      box-shadow:0 10px 40px rgba(0,0,0,.18);
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
      margin:0 0 22px;
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
      border-top:1px solid rgba(255,255,255,.08);
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
        Complete KYC
      </h1>

      <p class="subtitle">
        Your email has been verified successfully.
      </p>

    </td>
  </tr>

  <!-- CONTENT -->
  <tr>
    <td class="content">

      <p class="text">
        Congratulations! Your email address has been verified and your account is now active.
      </p>

      <p class="text">
        To unlock trading, deposits, withdrawals, and all premium features, please complete your <strong style="color:#ffffff;">KYC verification</strong>.
      </p>

      <div class="button-wrap">
        <a href="${kycUrl}" class="button">
          Complete KYC
        </a>
      </div>

      <p class="small-text">
        KYC verification is mandatory to ensure a secure trading experience and comply with regulatory requirements.
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

  passwordReset: (name, resetUrl) => `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

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
      box-shadow:0 10px 40px rgba(0,0,0,.18);
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
      margin:0 0 22px;
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
      margin:0 0 18px;
      color:#9ca3af;
      font-size:17px;
      line-height:28px;
    }

    .link{
      color:#ef4444;
      text-decoration:none;
      font-weight:600;
      word-break:break-all;
    }

    .footer{
      border-top:1px solid rgba(255,255,255,.08);
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
        Reset Password
      </h1>

      <p class="subtitle">
        A password reset request has been received for your account.
      </p>

    </td>
  </tr>

  <!-- CONTENT -->
  <tr>
    <td class="content">

      <p class="text">
        Hello <strong style="color:#ffffff;">${name}</strong>,
      </p>

      <p class="text">
        We received a request to reset the password for your <strong style="color:#ffffff;">Crixchange</strong> account. If you made this request, click the button below to create a new password.
      </p>

      <div class="button-wrap">
        <a href="${resetUrl}" class="button">
          Reset Password
        </a>
      </div>

      <p class="small-text">
        This password reset link will expire in <strong style="color:#ffffff;">10 minutes</strong>. If you didn't request a password reset, you can safely ignore this email. Your account will remain secure.
      </p>

      <p class="small-text">
        If the button above doesn't work, copy and paste the following link into your browser:
      </p>

      <p class="small-text">
        <a href="${resetUrl}" class="link">
          ${resetUrl}
        </a>
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
   <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

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
      box-shadow:0 10px 40px rgba(0,0,0,.18);
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
      margin:0 0 22px;
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
      border-top:1px solid rgba(255,255,255,.08);
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
        KYC Approved 🎉
      </h1>

      <p class="subtitle">
        Your verification is complete and your account is fully activated.
      </p>

    </td>
  </tr>

  <!-- CONTENT -->
  <tr>
    <td class="content">

      <p class="text">
        Congratulations <strong style="color:#ffffff;">${name}</strong>,
      </p>

      <p class="text">
        Your <strong style="color:#ffffff;">KYC verification</strong> has been successfully approved. You now have full access to all Crixchange trading features and can begin building your sports trading portfolio.
      </p>

      <div class="button-wrap">
        <a href="${process.env.FRONTEND_URL}/trading" class="button">
          Start Trading
        </a>
      </div>

      <p class="small-text">
        Thank you for completing the verification process. Trade responsibly, stay informed, and enjoy the Crixchange experience.
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

  kycRejected: (name, reason) => `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

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
      box-shadow:0 10px 40px rgba(0,0,0,.18);
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
      margin:0 0 22px;
      color:#d1d5db;
      font-size:19px;
      line-height:30px;
      font-weight:500;
    }

    .reason-box{
      margin:28px 0;
      padding:22px;
      background:#151515;
      border-left:4px solid #ef4444;
      border-radius:12px;
    }

    .reason-title{
      margin:0 0 10px;
      color:#ffffff;
      font-size:18px;
      font-weight:700;
    }

    .reason-text{
      margin:0;
      color:#d1d5db;
      font-size:18px;
      line-height:28px;
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
      border-top:1px solid rgba(255,255,255,.08);
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
        KYC Review Required
      </h1>

      <p class="subtitle">
        We need a few corrections before your verification can be approved.
      </p>

    </td>
  </tr>

  <!-- CONTENT -->
  <tr>
    <td class="content">

      <p class="text">
        Hello <strong style="color:#ffffff;">${name}</strong>,
      </p>

      <p class="text">
        We've reviewed your KYC submission and found that additional information or corrections are required before we can complete the verification process.
      </p>

      <div class="reason-box">

        <p class="reason-title">
          Review Feedback
        </p>

        <p class="reason-text">
          ${reason}
        </p>

      </div>

      <p class="text">
        Please update the required information and resubmit your KYC application. Once submitted, our team will review it as quickly as possible.
      </p>

      <div class="button-wrap">
        <a href="${process.env.FRONTEND_URL}/kyc" class="button">
          Update KYC
        </a>
      </div>

      <p class="small-text">
        If you believe this was sent in error or need assistance, our support team is always ready to help.
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

  tradeConfirmation: (name, tradeDetails) => `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

  <link href="https://fonts.googleapis.com/css2?family=Darker+Grotesque:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>

  <style>
    body{
      margin:0;
      padding:24px 12px;
      background:#f3f4f6;
      font-family:'Darker Grotesque','Helvetica Neue',Arial,sans-serif;
    }

    table{
      border-spacing:0;
      border-collapse:collapse;
    }

    .container{
      width:100%;
      max-width:520px;
      margin:auto;
      background:#0b0b0b;
      border-radius:24px;
      overflow:hidden;
      box-shadow:0 10px 40px rgba(0,0,0,.18);
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
      margin:0 0 24px;
      color:#d1d5db;
      font-size:19px;
      line-height:30px;
      font-weight:500;
    }

    .trade-card{
      background:#151515;
      border:1px solid rgba(255,255,255,.08);
      border-radius:18px;
      padding:20px;
      margin:30px 0;
    }

    .trade-table{
      width:100%;
    }

    .trade-table td{
      padding:12px 0;
      border-bottom:1px solid rgba(255,255,255,.06);
      font-size:18px;
    }

    .trade-table tr:last-child td{
      border-bottom:none;
    }

    .label{
      color:#9ca3af;
      font-weight:500;
    }

    .value{
      color:#ffffff;
      text-align:right;
      font-weight:700;
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
      color:#9ca3af;
      font-size:17px;
      line-height:28px;
      margin:0;
    }

    .footer{
      border-top:1px solid rgba(255,255,255,.08);
      background:#050505;
      padding:28px 20px;
      text-align:center;
    }

    .footer-logo{
      color:#ffffff;
      font-size:28px;
      font-weight:800;
    }

    .footer-text{
      margin-top:10px;
      color:#6b7280;
      font-size:15px;
      line-height:24px;
    }

    @media only screen and (max-width:600px){

      .hero{padding:46px 22px!important;}
      .content{padding:32px 22px!important;}

      .logo{font-size:34px!important;}

      .title{
        font-size:34px!important;
        line-height:38px!important;
      }

      .subtitle{
        font-size:18px!important;
        line-height:28px!important;
      }

      .text{
        font-size:18px!important;
      }

      .trade-table td{
        font-size:17px!important;
      }

      .button{
        font-size:17px!important;
        padding:14px 30px!important;
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
        Trade Confirmed
      </h1>

      <p class="subtitle">
        Your order has been successfully executed.
      </p>

    </td>
  </tr>

  <!-- CONTENT -->
  <tr>
    <td class="content">

      <p class="text">
        Hello <strong style="color:#ffffff;">${name}</strong>,
      </p>

      <p class="text">
        Your trade has been completed successfully. Below is a summary of your transaction.
      </p>

      <div class="trade-card">

        <table class="trade-table">

          <tr>
            <td class="label">Trade Type</td>
            <td class="value">${tradeDetails.type.toUpperCase()}</td>
          </tr>

          <tr>
            <td class="label">Team</td>
            <td class="value">${tradeDetails.team}</td>
          </tr>

          <tr>
            <td class="label">Quantity</td>
            <td class="value">${tradeDetails.quantity}</td>
          </tr>

          <tr>
            <td class="label">Price</td>
            <td class="value">₹${tradeDetails.price}</td>
          </tr>

          <tr>
            <td class="label"><strong>Total Amount</strong></td>
            <td class="value"><strong>₹${tradeDetails.totalAmount}</strong></td>
          </tr>

        </table>

      </div>

      <div class="button-wrap">
        <a href="${process.env.FRONTEND_URL}/portfolio" class="button">
          View Portfolio
        </a>
      </div>

      <p class="small-text">
        Thank you for trading with Crixchange. You can track your portfolio performance and transaction history anytime from your dashboard.
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

  depositConfirmation: (name, amount, method) => `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

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
      border-collapse:collapse;
    }

    .container{
      width:100%;
      max-width:520px;
      margin:auto;
      background:#0b0b0b;
      border-radius:24px;
      overflow:hidden;
      box-shadow:0 10px 40px rgba(0,0,0,.18);
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
      margin:0 0 24px;
      color:#d1d5db;
      font-size:19px;
      line-height:30px;
      font-weight:500;
    }

    .amount-card{
      margin:32px 0;
      padding:30px 20px;
      background:#151515;
      border:1px solid rgba(255,255,255,.08);
      border-radius:18px;
      text-align:center;
    }

    .amount-label{
      margin:0;
      color:#9ca3af;
      font-size:18px;
      font-weight:600;
    }

    .amount{
      margin:10px 0 0;
      color:#ffffff;
      font-size:48px;
      font-weight:800;
      letter-spacing:-1px;
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
      border-top:1px solid rgba(255,255,255,.08);
      background:#050505;
      padding:28px 20px;
      text-align:center;
    }

    .footer-logo{
      color:#ffffff;
      font-size:28px;
      font-weight:800;
      letter-spacing:-1px;
    }

    .footer-text{
      margin:10px 0 0;
      color:#6b7280;
      font-size:15px;
      line-height:24px;
    }

    @media only screen and (max-width:600px){

      .hero{
        padding:46px 22px!important;
      }

      .content{
        padding:32px 22px!important;
      }

      .logo{
        font-size:34px!important;
      }

      .title{
        font-size:34px!important;
        line-height:38px!important;
      }

      .subtitle{
        font-size:18px!important;
        line-height:28px!important;
      }

      .text{
        font-size:18px!important;
      }

      .amount{
        font-size:40px!important;
      }

      .button{
        font-size:17px!important;
        padding:14px 30px!important;
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
        Deposit Successful
      </h1>

      <p class="subtitle">
        Your wallet has been credited successfully.
      </p>

    </td>
  </tr>

  <!-- CONTENT -->
  <tr>
    <td class="content">

      <p class="text">
        Hello <strong style="color:#ffffff;">${name}</strong>,
      </p>

      <p class="text">
        Your deposit has been processed successfully and the funds are now available in your Crixchange wallet.
      </p>

      <div class="amount-card">

        <p class="amount-label">
          Amount Credited
        </p>

        <h2 class="amount">
          ₹${amount}
        </h2>

      </div>

      <div class="button-wrap">
        <a href="${process.env.FRONTEND_URL}/wallet" class="button">
          View Wallet
        </a>
      </div>

      <p class="small-text">
        Your updated wallet balance is now available for trading, deposits, and other supported transactions.
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

  withdrawalConfirmation: (name, amount, status) => `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

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
      border-collapse:collapse;
    }

    .container{
      width:100%;
      max-width:520px;
      margin:auto;
      background:#0b0b0b;
      border-radius:24px;
      overflow:hidden;
      box-shadow:0 10px 40px rgba(0,0,0,.18);
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
      margin:0 0 24px;
      color:#d1d5db;
      font-size:19px;
      line-height:30px;
      font-weight:500;
    }

    .amount-card{
      margin:30px 0;
      padding:28px 22px;
      background:#151515;
      border:1px solid rgba(255,255,255,.08);
      border-radius:18px;
      text-align:center;
    }

    .amount-label{
      margin:0;
      color:#9ca3af;
      font-size:18px;
      font-weight:600;
    }

    .amount{
      margin:12px 0;
      color:#ffffff;
      font-size:48px;
      font-weight:800;
      letter-spacing:-1px;
    }

    .status{
      color:#d1d5db;
      font-size:18px;
      line-height:28px;
      margin:0;
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
      border-top:1px solid rgba(255,255,255,.08);
      background:#050505;
      padding:28px 20px;
      text-align:center;
    }

    .footer-logo{
      color:#ffffff;
      font-size:28px;
      font-weight:800;
      letter-spacing:-1px;
    }

    .footer-text{
      margin:10px 0 0;
      color:#6b7280;
      font-size:15px;
      line-height:24px;
    }

    @media only screen and (max-width:600px){

      .hero{
        padding:46px 22px!important;
      }

      .content{
        padding:32px 22px!important;
      }

      .logo{
        font-size:34px!important;
      }

      .title{
        font-size:34px!important;
        line-height:38px!important;
      }

      .subtitle{
        font-size:18px!important;
        line-height:28px!important;
      }

      .text{
        font-size:18px!important;
      }

      .amount{
        font-size:40px!important;
      }

      .button{
        font-size:17px!important;
        padding:14px 30px!important;
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
        Withdrawal ${status === "completed" ? "Completed" : "Initiated"}
      </h1>

      <p class="subtitle">
        ${status === "completed"
          ? "Your withdrawal has been successfully processed."
          : "Your withdrawal request is currently being processed."}
      </p>

    </td>
  </tr>

  <!-- CONTENT -->
  <tr>
    <td class="content">

      <p class="text">
        Hello <strong style="color:#ffffff;">${name}</strong>,
      </p>

      <p class="text">
        ${
          status === "completed"
            ? "We're pleased to inform you that your withdrawal has been successfully transferred to your registered bank account."
            : "We've received your withdrawal request and it's currently under processing. You'll receive another email once the transfer has been completed."
        }
      </p>

      <div class="amount-card">

        <p class="amount-label">
          Withdrawal Amount
        </p>

        <h2 class="amount">
          ₹${amount}
        </h2>

        <p class="status">
          ${
            status === "completed"
              ? "Transferred to your registered bank account."
              : "Estimated processing time: 1–2 business days."
          }
        </p>

      </div>

      <div class="button-wrap">
        <a href="${process.env.FRONTEND_URL}/wallet" class="button">
          View Transactions
        </a>
      </div>

      <p class="small-text">
        You can view the complete status and history of your withdrawals anytime from your wallet dashboard.
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