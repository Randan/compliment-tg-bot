import bot from '../bot';
import { adminId } from './';

const notifyAdmin = (message: string): void => {
  if (!adminId) {
    console.warn('⚠️ ADMIN_TG_ID is not set, skipping admin notification');
    return;
  }

  bot.sendMessage(adminId, message, { parse_mode: 'Markdown' }).catch(err => {
    console.error('Failed to send admin notification:', err);
  });
};

export default notifyAdmin;
