import mongoose from 'mongoose';
import { AxiosResponse } from 'axios';
import bot from '../bot';
import { getPhoto } from '../api';
import { dbMongooseUri, handleError, lib, notifyAdmin } from '../utils';
import { Compliments, Users } from '../schemas';
import { ICompliment, IUnsplashResponse, IUser } from '../interfaces';

const sendComplimentAndFlowerToAllUsers = async (): Promise<void> => {
  try {
    mongoose.connect(dbMongooseUri);

    const complimentsCount = await Compliments.countDocuments({});

    if (!complimentsCount) return;

    const random = Math.floor(Math.random() * complimentsCount);

    const users: IUser[] | null = await Users.find({});

    if (!users || !users.length) return;

    const compliment: ICompliment | null = await Compliments.findOne({}).skip(
      random
    );

    if (!compliment) return;

    const flowerPhoto: AxiosResponse<IUnsplashResponse> = await getPhoto(
      'flower'
    );

    users.forEach((user: IUser): void => {
      flowerPhoto
        ? bot.sendPhoto(user.telegramId, flowerPhoto.data.urls.regular, {
          caption: compliment.value,
        })
        : bot.sendMessage(user.telegramId, compliment.value);
    });

    // notifyAdmin(lib.allUsersGotCompliment());
  } catch (err: unknown) {
    handleError(JSON.stringify(err));
  }
};

export default sendComplimentAndFlowerToAllUsers;
