import type { OnModuleInit } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@randan/tg-logger';
import * as cron from 'node-cron';

import { ComplimentService } from './compliment.service';
import { ComplimentBotService } from './compliment-bot.service';
import { UnsplashService } from './unsplash.service';
import { UserService } from './user.service';

@Injectable()
export class ComplimentCronService implements OnModuleInit {
  constructor(
    private readonly config: ConfigService,
    private readonly complimentService: ComplimentService,
    private readonly userService: UserService,
    private readonly unsplashService: UnsplashService,
    private readonly botService: ComplimentBotService,
    private readonly logger: LoggerService,
  ) {}

  onModuleInit(): void {
    const timeZone = this.config.get<string>('TIMEZONE') || 'Europe/Kyiv';
    cron.schedule('0 10 * * *', () => this.sendComplimentAndFlowerToAllUsers(), { timezone: timeZone });
    this.logger.log('Compliment daily cron registered (10:00)', { timeZone });
  }

  async sendComplimentAndFlowerToAllUsers(): Promise<void> {
    try {
      const count = await this.complimentService.count();
      if (!count) {
        return;
      }

      const users = await this.userService.findAll();
      if (!users.length) {
        return;
      }

      const compliment = await this.complimentService.findRandom();
      if (!compliment) {
        return;
      }

      let photoUrl: string | null = null;
      try {
        const photo = await this.unsplashService.getPhoto('flower');
        photoUrl = photo?.urls?.regular || null;
      } catch {
        // continue without photo
      }

      const sendPromises = users.map(async user => {
        try {
          if (photoUrl) {
            await this.botService.sendPhotoSafely(user.telegramId, photoUrl, {
              caption: compliment.value,
              removeOnBlock: true,
            });
          } else {
            await this.botService.sendMessageSafely(user.telegramId, compliment.value, {
              removeOnBlock: true,
            });
          }
        } catch (err) {
          this.logger.error(`Failed to send to user ${user.telegramId}`, err);
        }
      });

      await Promise.allSettled(sendPromises);
    } catch (err) {
      this.logger.error('Failed to send compliment and flower to all users', err);
    }
  }
}
