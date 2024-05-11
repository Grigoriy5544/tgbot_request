import { Module } from '@nestjs/common';
import { AppUpdate } from './app.update';
import { AppService } from './app.service';
import {TelegrafModule} from "nestjs-telegraf";
import * as LocalSession from "telegraf-session-local"
import {ConfigModule, ConfigService} from '@nestjs/config';

const session = new LocalSession({database: 'session_db.json'})

@Module({
  imports: [
      ConfigModule.forRoot({
          isGlobal: true
      }),
      TelegrafModule.forRootAsync({
          useFactory: async (configService: ConfigService) => ({
              token: configService.get<string>('TG_TOKEN'), // Используем асинхронную функцию для получения токена
              middlewares: [session.middleware()],
          }),
          inject: [ConfigService], // Инжекция ConfigService
      }),
  ],
  providers: [AppService, AppUpdate],
})
export class AppModule {}
