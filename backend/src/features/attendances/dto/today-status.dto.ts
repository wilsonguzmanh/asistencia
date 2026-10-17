import { ApiProperty } from '@nestjs/swagger';

export class ClassScheduleSummaryDto {
  @ApiProperty({ example: 'b5a6c382-9f37-4b71-b062-81523f66345e' })
  id: string;

  @ApiProperty({ example: '2026-10-13' })
  classDate: string;

  @ApiProperty({ example: '18:00' })
  startTime: string;

  @ApiProperty({ example: '21:00' })
  endTime: string;
}

export class AttendanceRecordDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: '2026-10-13T22:00:00.000Z' })
  markedAt: Date | string | null;

  @ApiProperty({ example: 'PRESENTE' })
  status: string;
}

export class TodayStatusResponseDto {
  @ApiProperty({ example: true })
  hasClassToday: boolean;

  @ApiProperty({ type: ClassScheduleSummaryDto, nullable: true })
  classSchedule: ClassScheduleSummaryDto | null;

  @ApiProperty({ example: false })
  alreadyMarked: boolean;

  @ApiProperty({ type: AttendanceRecordDto, nullable: true })
  attendance: AttendanceRecordDto | null;

  @ApiProperty({ type: ClassScheduleSummaryDto, nullable: true })
  nextScheduledClass?: ClassScheduleSummaryDto | null;
}
