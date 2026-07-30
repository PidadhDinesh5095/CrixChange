// kafka/handlers/wallet.handler.js
import {
  sendDepositConfirmationEmail,
  sendWithdrawalConfirmationEmail,
} from '../../utils/sendEmail.js';
import { EVENT_TYPES } from '../constants.js';

const handleDepositSuccess = async ({ email, name, amount }) => {
  await sendDepositConfirmationEmail(email, name, amount);
};

// WITHDRAWAL_INITIATED and WITHDRAWAL_COMPLETED share the same email
// template with a different `status`. Both events for the same
// withdrawal are published with the same userId key, so they land on
// the same partition and are processed in the order they occurred:
// "Initiated" email before "Completed" email.
const handleWithdrawal = async ({ email, name, amount, status }) => {
  await sendWithdrawalConfirmationEmail(email, name, amount, status);
};

export const walletHandlers = {
  [EVENT_TYPES.DEPOSIT_SUCCESS]: handleDepositSuccess,
  [EVENT_TYPES.WITHDRAWAL_INITIATED]: handleWithdrawal,
  [EVENT_TYPES.WITHDRAWAL_COMPLETED]: handleWithdrawal,
};

export default walletHandlers;