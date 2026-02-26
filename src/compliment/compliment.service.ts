import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { ComplimentDoc } from './schemas/compliment.schema';

@Injectable()
export class ComplimentService {
  constructor(
    @InjectModel(ComplimentDoc.name)
    private readonly complimentModel: Model<ComplimentDoc>,
  ) {}

  async count(): Promise<number> {
    return this.complimentModel.countDocuments({}).exec();
  }

  async findRandom(): Promise<ComplimentDoc | null> {
    const count = await this.count();
    if (!count) {
      return null;
    }
    const random = Math.floor(Math.random() * count);
    return this.complimentModel.findOne({}).skip(random).exec();
  }

  async findByValue(value: string): Promise<ComplimentDoc | null> {
    return this.complimentModel.findOne({ value }).exec();
  }

  async add(value: string): Promise<ComplimentDoc> {
    return this.complimentModel.create({ value });
  }
}
