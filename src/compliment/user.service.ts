import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { User } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async findByTelegramId(telegramId: number): Promise<User | null> {
    return this.userModel.findOne({ telegramId }).exec();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find({}).exec();
  }

  async add(telegramId: number, firstName: string, lastName?: string, userName?: string): Promise<User> {
    return this.userModel.create({
      telegramId,
      firstName,
      lastName,
      userName,
    });
  }

  async removeByTelegramId(telegramId: number): Promise<User | null> {
    return this.userModel.findOneAndDelete({ telegramId }).exec();
  }
}
