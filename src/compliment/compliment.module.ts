import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { ComplimentDoc, ComplimentSchema } from './schemas/compliment.schema';
import { UserService } from './user.service';
import { ComplimentService } from './compliment.service';
import { UnsplashService } from './unsplash.service';
import { ComplimentBotService } from './compliment-bot.service';
import { ComplimentCronService } from './compliment-cron.service';
import { ComplimentHandler } from './compliment.handler';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        imports: [ConfigModule],
        useFactory: (config: ConfigService) => {
          const schema = UserSchema;
          schema.set('collection', config.get<string>('DB_USERS_COLLECTION'));
          return schema;
        },
        inject: [ConfigService],
      },
      {
        name: ComplimentDoc.name,
        imports: [ConfigModule],
        useFactory: (config: ConfigService) => {
          const schema = ComplimentSchema;
          schema.set(
            'collection',
            config.get<string>('DB_COMPLIMENTS_COLLECTION'),
          );
          return schema;
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [
    UserService,
    ComplimentService,
    UnsplashService,
    ComplimentBotService,
    ComplimentCronService,
    ComplimentHandler,
  ],
})
export class ComplimentModule {}
