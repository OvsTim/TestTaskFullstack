import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { MeasurementUnitsModule } from './measurement-units/measurement-units.module';
import { WorkEntriesModule } from './work-entries/work-entries.module';
import { WorkTypesModule } from './work-types/work-types.module';

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
    MeasurementUnitsModule,
    WorkTypesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
