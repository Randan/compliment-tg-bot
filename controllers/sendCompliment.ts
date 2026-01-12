import type { Message } from 'node-telegram-bot-api';
import bot from '../bot';
import { botHelpers, handleError, lib } from '../utils';
import { Compliments, Users } from '../schemas';
import type { ICompliment, IUser } from '../interfaces';

const sendCompliment = async (msg: Message): Promise<void> => {
  if (!msg.from) return;

  const { id } = msg.from;

  try {
    const user: IUser | null = await Users.findOne({ telegramId: id });

    if (!user) {
      await botHelpers.sendMessageSafely(id, lib.userNotExists());
      return;
    }

    const complimentsCount = await Compliments.countDocuments({});

    if (!complimentsCount) return;

    const random = Math.floor(Math.random() * complimentsCount);

    const compliment: ICompliment | null = await Compliments.findOne({}).skip(random);

    if (compliment) {
      await botHelpers.sendMessageSafely(id, compliment.value);
    }
  } catch (err: unknown) {
    handleError('Failed to send compliment', err);
  }
};

export default sendCompliment;
