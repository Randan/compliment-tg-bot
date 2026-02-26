import { LoggerService } from '@randan/tg-logger';
import { Command, Ctx, Update } from 'nestjs-telegraf';
import type { Context } from 'telegraf';

import { ComplimentService } from './compliment.service';
import { ComplimentBotService } from './compliment-bot.service';
import { ComplimentCronService } from './compliment-cron.service';
import { UnsplashService } from './unsplash.service';
import { UserService } from './user.service';

const HELP_TEXT =
  'Вітаю! Мене звати ComplimentBot.\n\n' +
  'Якщо хочеш - я буду відправляти тобі компліменти.\n\n' +
  '/help - Допомога\n' +
  '/start - Дозволь мені говорити тобі приємне\n' +
  '/stop - Скажи мені "Па-па"\n' +
  '/compliment - Якщо хочешь комплімент прямо тут і зараз.\n' +
  '/flower - Отримай квіточку\n' +
  '/cat - Подивись на котика\n' +
  '/dog - Попести песика';

@Update()
export class ComplimentHandler {
  constructor(
    private readonly userService: UserService,
    private readonly complimentService: ComplimentService,
    private readonly unsplashService: UnsplashService,
    private readonly botService: ComplimentBotService,
    private readonly cronService: ComplimentCronService,
    private readonly logger: LoggerService,
  ) {}

  @Command('help')
  async help(@Ctx() ctx: Context): Promise<void> {
    const chatId = ctx.chat?.id;
    if (!chatId) {
      return;
    }
    await this.botService.sendMessageSafely(chatId, HELP_TEXT);
  }

  @Command('start')
  async start(@Ctx() ctx: Context): Promise<void> {
    const from = ctx.from;
    const chatId = ctx.chat?.id;
    if (!from || !chatId) {
      return;
    }

    const { id, first_name, last_name, username } = from;
    try {
      const existing = await this.userService.findByTelegramId(id);
      if (existing) {
        await this.botService.sendMessageSafely(
          chatId,
          'Так я і так відправляю тобі компліменти. Тобі мало? Звернись до розробника!',
        );
        return;
      }
      await this.userService.add(id, first_name, last_name, username);
      await this.botService.sendMessageSafely(
        chatId,
        `Вітаю, ${first_name}! Тепер я буду відправляти тобі компліменти =)`,
      );
    } catch (err) {
      this.logger.error('Failed to add user', err);
    }
  }

  @Command('stop')
  async stop(@Ctx() ctx: Context): Promise<void> {
    const from = ctx.from;
    const chatId = ctx.chat?.id;
    if (!from || !chatId) {
      return;
    }

    const { id, first_name } = from;
    try {
      const removed = await this.userService.removeByTelegramId(id);
      if (removed) {
        await this.botService.sendMessageSafely(
          chatId,
          `Ну що, ${first_name}! Будемо досвіданькатись? Мені було добре з тобою, приходь ще =)`,
        );
      } else {
        await this.botService.sendMessageSafely(chatId, 'Ми з вами не знайомі. Давайте познайомимось. Напишіть /start');
      }
    } catch (err) {
      this.logger.error('Failed to remove user', err);
    }
  }

  @Command('compliment')
  async compliment(@Ctx() ctx: Context): Promise<void> {
    const from = ctx.from;
    const chatId = ctx.chat?.id;
    if (!from || !chatId) {
      return;
    }

    const { id } = from;
    try {
      const user = await this.userService.findByTelegramId(id);
      if (!user) {
        await this.botService.sendMessageSafely(chatId, 'Ми з вами не знайомі. Давайте познайомимось. Напишіть /start');
        return;
      }
      const compliment = await this.complimentService.findRandom();
      if (compliment) {
        await this.botService.sendMessageSafely(chatId, compliment.value);
      }
    } catch (err) {
      this.logger.error('Failed to send compliment', err);
    }
  }

  @Command('toAll')
  async toAll(@Ctx() _ctx: Context): Promise<void> {
    await this.cronService.sendComplimentAndFlowerToAllUsers();
  }

  @Command('add')
  async add(@Ctx() ctx: Context): Promise<void> {
    const from = ctx.from;
    const chatId = ctx.chat?.id;
    if (!from || !chatId) {
      return;
    }

    const msg = ctx.message;
    const text = msg && 'text' in msg && typeof msg.text === 'string' ? msg.text.replace(/\/add\s*/, '').trim() : '';
    if (!text) {
      return;
    }

    try {
      const existing = await this.complimentService.findByValue(text);
      if (existing) {
        await this.botService.sendMessageSafely(chatId, 'А такий вже є, придумай інший ¯\\_(ツ)_/¯');
        return;
      }
      await this.complimentService.add(text);
      await this.botService.sendMessageSafely(chatId, 'Поняв-приняв, дякую ;)');
    } catch (err) {
      this.logger.error('Failed to add compliment', err);
    }
  }

  async sendPhotoFromStock(chatId: number, query: string, caption?: string): Promise<void> {
    try {
      const photo = await this.unsplashService.getPhoto(query);
      if (photo?.urls?.regular) {
        await this.botService.sendPhotoSafely(chatId, photo.urls.regular, {
          caption,
        });
      }
    } catch (err) {
      this.logger.error('Failed to send photo from stock', err);
    }
  }

  @Command('flower')
  async flower(@Ctx() ctx: Context): Promise<void> {
    const from = ctx.from;
    const chatId = ctx.chat?.id;
    if (!from || !chatId) {
      return;
    }

    const user = await this.userService.findByTelegramId(from.id);
    if (!user) {
      await this.botService.sendMessageSafely(chatId, 'Ми з вами не знайомі. Давайте познайомимось. Напишіть /start');
      return;
    }
    await this.sendPhotoFromStock(chatId, 'flower', 'Тримай квіточку');
  }

  @Command('cat')
  async cat(@Ctx() ctx: Context): Promise<void> {
    const from = ctx.from;
    const chatId = ctx.chat?.id;
    if (!from || !chatId) {
      return;
    }

    const user = await this.userService.findByTelegramId(from.id);
    if (!user) {
      await this.botService.sendMessageSafely(chatId, 'Ми з вами не знайомі. Давайте познайомимось. Напишіть /start');
      return;
    }
    await this.sendPhotoFromStock(chatId, 'cat', 'Тримай котика');
  }

  @Command('dog')
  async dog(@Ctx() ctx: Context): Promise<void> {
    const from = ctx.from;
    const chatId = ctx.chat?.id;
    if (!from || !chatId) {
      return;
    }

    const user = await this.userService.findByTelegramId(from.id);
    if (!user) {
      await this.botService.sendMessageSafely(chatId, 'Ми з вами не знайомі. Давайте познайомимось. Напишіть /start');
      return;
    }
    await this.sendPhotoFromStock(chatId, 'dog', 'Тримай песика');
  }

  @Command('getPhoto')
  async getPhoto(@Ctx() ctx: Context): Promise<void> {
    const from = ctx.from;
    const chatId = ctx.chat?.id;
    if (!from || !chatId) {
      return;
    }

    const msg = ctx.message;
    const text =
      msg && 'text' in msg && typeof msg.text === 'string' ? msg.text.replace(/\/getPhoto\s*/, '').trim() : '';
    if (!text) {
      return;
    }

    const user = await this.userService.findByTelegramId(from.id);
    if (!user) {
      await this.botService.sendMessageSafely(chatId, 'Ми з вами не знайомі. Давайте познайомимось. Напишіть /start');
      return;
    }
    await this.sendPhotoFromStock(chatId, text);
  }
}
