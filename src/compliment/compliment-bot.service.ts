import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { UserService } from './user.service';

@Injectable()
export class ComplimentBotService {
  constructor(
    @InjectBot() private readonly bot: Telegraf,
    private readonly userService: UserService,
  ) {}

  async sendMessageSafely(
    telegramId: number,
    message: string,
    options?: { parse_mode?: 'Markdown' | 'HTML'; removeOnBlock?: boolean },
  ): Promise<boolean> {
    const removeOnBlock = options?.removeOnBlock ?? false;
    try {
      await this.bot.telegram.sendMessage(telegramId, message, {
        parse_mode: options?.parse_mode,
      });
      return true;
    } catch (err: unknown) {
      const error = err as {
        response?: { body?: { error_code?: number; description?: string } };
      };
      const code = error.response?.body?.error_code;
      const desc = (error.response?.body?.description || '').toLowerCase();
      const isBlocked =
        code === 403 ||
        code === 400 ||
        desc.includes('blocked') ||
        desc.includes('chat not found') ||
        desc.includes('user is deactivated');
      if (isBlocked) {
        if (removeOnBlock) {
          await this.userService.removeByTelegramId(telegramId);
          console.log(`User ${telegramId} blocked the bot, removed from database`);
        } else {
          console.log(`User ${telegramId} blocked the bot`);
        }
        return false;
      }
      throw err;
    }
  }

  async sendPhotoSafely(
    telegramId: number,
    photoUrl: string,
    options?: { caption?: string; removeOnBlock?: boolean },
  ): Promise<boolean> {
    const removeOnBlock = options?.removeOnBlock ?? false;
    try {
      await this.bot.telegram.sendPhoto(telegramId, photoUrl, {
        caption: options?.caption,
      });
      return true;
    } catch (err: unknown) {
      const error = err as {
        response?: { body?: { error_code?: number; description?: string } };
      };
      const code = error.response?.body?.error_code;
      const desc = (error.response?.body?.description || '').toLowerCase();
      const isBlocked =
        code === 403 ||
        code === 400 ||
        desc.includes('blocked') ||
        desc.includes('chat not found') ||
        desc.includes('user is deactivated');
      if (isBlocked) {
        if (removeOnBlock) {
          await this.userService.removeByTelegramId(telegramId);
          console.log(`User ${telegramId} blocked the bot, removed from database`);
        } else {
          console.log(`User ${telegramId} blocked the bot`);
        }
        return false;
      }
      throw err;
    }
  }
}
