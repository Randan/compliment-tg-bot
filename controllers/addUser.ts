import type { Message } from 'node-telegram-bot-api';
import { botHelpers, handleError, lib } from '../utils';
import { Users } from '../schemas';
import type { IUser } from '../interfaces';

const addUser = async (msg: Message): Promise<void> => {
  if (!msg.from) return;

  const { id, first_name, last_name, username } = msg.from;

  const newUser: IUser = {
    telegramId: id,
    firstName: first_name,
    lastName: last_name,
    userName: username,
  };

  try {
    const user: IUser | null = await Users.findOne({ telegramId: id });

    if (user) {
      await botHelpers.sendMessageSafely(id, lib.userExists());
      return;
    }

    const userAddedResponse: IUser = await Users.create(newUser);

    if (userAddedResponse) {
      await botHelpers.sendMessageSafely(id, lib.userAccepted(msg));
    }
  } catch (err: unknown) {
    handleError('Failed to add user', err);
  }
};

export default addUser;
