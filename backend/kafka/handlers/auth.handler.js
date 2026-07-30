// kafka/handlers/auth.handler.js
import {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendEmailVerificationSuccessEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
} from '../../utils/sendEmail.js';
import { EVENT_TYPES } from '../constants.js';

/**
 * USER_REGISTERED
 * Order enforced: welcome email first, then the verification email.
 * The two are sequentially awaited (not Promise.all), which
 * guarantees the welcome email is dispatched before the verification
 * email — welcome > verify, as requested.
 */
const handleUserRegistered = async ({ email, name, verificationUrl }) => {
  await sendWelcomeEmail(email, name);
  await sendVerificationEmail(email, name, verificationUrl);
};

/**
 * EMAIL_VERIFIED
 * Fired once the user clicks the verification link. This is the next
 * step in the chronological funnel: welcome -> verify -> (this) -> KYC.
 */
const handleEmailVerified = async ({ email, kycUrl }) => {
  await sendEmailVerificationSuccessEmail(email, kycUrl);
};

const handlePasswordResetRequested = async ({ email, name, resetUrl }) => {
  await sendPasswordResetEmail(email, name, resetUrl);
};

const handlePasswordChanged = async ({ email, changePasswordUrl }) => {
  await sendPasswordChangedEmail(email, changePasswordUrl);
};

export const authHandlers = {
  [EVENT_TYPES.USER_REGISTERED]: handleUserRegistered,
  [EVENT_TYPES.EMAIL_VERIFIED]: handleEmailVerified,
  [EVENT_TYPES.PASSWORD_RESET_REQUESTED]: handlePasswordResetRequested,
  [EVENT_TYPES.PASSWORD_CHANGED]: handlePasswordChanged,
};

export default authHandlers;