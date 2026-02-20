import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { ComplimentModule } from '../compliment/compliment.module';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const token = config.get<string>('BOT_TOKEN');
        if (!token) throw new Error('BOT_TOKEN is required');
        return { token, include: [ComplimentModule] };
      },
      inject: [ConfigService],
    }),
    ComplimentModule,
  ],
})
export class TelegramModule {}
