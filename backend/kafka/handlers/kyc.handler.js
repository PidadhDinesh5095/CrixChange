// kafka/handlers/kyc.handler.js
import { sendKYCApprovalEmail, sendKYCRejectionEmail } from '../../utils/sendEmail.js';
import { EVENT_TYPES } from '../constants.js';

const handleKycApproved = async ({ email, name }) => {
  await sendKYCApprovalEmail(email, name);
};

const handleKycRejected = async ({ email, name, reason }) => {
  await sendKYCRejectionEmail(email, name, reason);
};

export const kycHandlers = {
  [EVENT_TYPES.KYC_APPROVED]: handleKycApproved,
  [EVENT_TYPES.KYC_REJECTED]: handleKycRejected,
};

export default kycHandlers;