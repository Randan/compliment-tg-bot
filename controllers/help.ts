import type { Message } from 'node-telegram-bot-api';
import { botHelpers, lib } from '../utils';

const help = async (msg: Message): Promise<void> => {
  if (!msg.from) return;
  const { id } = msg.from;

  await botHelpers.sendMessageSafely(id, lib.help(msg));
};

export default help;
