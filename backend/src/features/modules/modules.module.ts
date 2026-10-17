import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicModule } from './entities/academic-module.entity';
import { Student } from '../students/entities/student.entity';
import { ClassSchedule } from '../schedules/entities/class-schedule.entity';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { ModulesController } from './modules.controller';
import { ExcelParserService } from './services/excel-parser.service';
import { ScheduleParserService } from './services/schedule-parser.service';
import { ModulesService } from './services/modules.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AcademicModule, Student, ClassSchedule]),
    ActivityLogsModule,
  ],
  controllers: [ModulesController],
  providers: [ExcelParserService, ScheduleParserService, ModulesService],
  exports: [ExcelParserService, ScheduleParserService, ModulesService],
})
export class ModulesModule {}
