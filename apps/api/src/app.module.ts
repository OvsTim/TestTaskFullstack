import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { WorkEntriesModule } from './work-entries/work-entries.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(process.cwd(), '.env'),
        join(process.cwd(), '../../.env'),
      ],
    }),
    PrismaModule,
    WorkEntriesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
