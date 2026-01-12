import type { AxiosResponse } from 'axios';
import type { Message } from 'node-telegram-bot-api';
import { getPhoto } from '../api';
import { botHelpers, handleError, lib } from '../utils';
import { Users } from '../schemas';
import type { IUnsplashResponse, IUser } from '../interfaces';

const sendPhotoFromStock = async (msg: Message, query: string, caption?: string): Promise<void> => {
  if (!msg.from) return;

  const { id } = msg.from;

  try {
    const user: IUser | null = await Users.findOne({ telegramId: id });

    if (!user) {
      await botHelpers.sendMessageSafely(id, lib.userNotExists());
      return;
    }

    const photo: AxiosResponse<IUnsplashResponse> = await getPhoto(query);

    if (photo) {
      await botHelpers.sendPhotoSafely(id, photo.data.urls.regular, {
        caption,
      });
    }
  } catch (err: unknown) {
    handleError('Failed to send photo from stock', err);
  }
};

export default sendPhotoFromStock;
