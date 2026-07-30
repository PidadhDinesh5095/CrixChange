// kafka/handlers/trade.handler.js
import { sendTradeConfirmationEmail } from '../../utils/sendEmail.js';
import { EVENT_TYPES } from '../constants.js';

const handleTradeExecuted = async ({ email, name, tradeDetails }) => {
  await sendTradeConfirmationEmail(email, name, tradeDetails);
};

export const tradeHandlers = {
  [EVENT_TYPES.TRADE_EXECUTED]: handleTradeExecuted,
};

export default tradeHandlers;