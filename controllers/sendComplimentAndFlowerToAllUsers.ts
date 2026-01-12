import type { AxiosResponse } from 'axios';
import { getPhoto } from '../api';
import { botHelpers, handleError } from '../utils';
import { Compliments, Users } from '../schemas';
import type { ICompliment, IUnsplashResponse, IUser } from '../interfaces';

const sendComplimentAndFlowerToAllUsers = async (): Promise<void> => {
  try {
    const complimentsCount = await Compliments.countDocuments({});

    if (!complimentsCount) return;

    const random = Math.floor(Math.random() * complimentsCount);

    const users: IUser[] | null = await Users.find({});

    if (!users || !users.length) return;

    const compliment: ICompliment | null = await Compliments.findOne({}).skip(random);

    if (!compliment) return;

    const flowerPhoto: AxiosResponse<IUnsplashResponse> = await getPhoto('flower');

    // Send messages to all users and handle blocked users
    // For proactive messages, remove blocked users from database
    const sendPromises = users.map(async (user: IUser): Promise<void> => {
      try {
        if (flowerPhoto) {
          await botHelpers.sendPhotoSafely(user.telegramId, flowerPhoto.data.urls.regular, {
            caption: compliment.value,
            removeOnBlock: true,
          });
        } else {
          await botHelpers.sendMessageSafely(user.telegramId, compliment.value, { removeOnBlock: true });
        }
      } catch (err: unknown) {
        // Individual user errors are already handled in sendMessageSafely/sendPhotoSafely
        // Only log if it's not a blocking error
        const error = err as { response?: { body?: { error_code?: number } } };
        if (error.response?.body?.error_code !== 403 && error.response?.body?.error_code !== 400) {
          console.error(`Failed to send to user ${user.telegramId}:`, err);
        }
      }
    });

    await Promise.allSettled(sendPromises);
  } catch (err: unknown) {
    handleError('Failed to send compliment and flower to all users', err);
  }
};

export default sendComplimentAndFlowerToAllUsers;
