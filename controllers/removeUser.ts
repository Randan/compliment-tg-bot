import type { Message } from 'node-telegram-bot-api';
import { botHelpers, handleError, lib } from '../utils';
import { Users } from '../schemas';
import type { IUser } from '../interfaces';

const removeUser = async (msg: Message): Promise<void> => {
  if (!msg.from) return;

  const { id } = msg.from;

  try {
    const removedUserResponse: IUser | null = await Users.findOneAndDelete({
      telegramId: id,
    });

    if (removedUserResponse) {
      await botHelpers.sendMessageSafely(id, lib.userRemoved(msg));
    } else {
      await botHelpers.sendMessageSafely(id, lib.userNotExists());
    }
  } catch (err: unknown) {
    handleError('Failed to remove user', err);
  }
};

export default removeUser;
