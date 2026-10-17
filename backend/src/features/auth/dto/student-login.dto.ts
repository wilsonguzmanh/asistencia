import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class StudentLoginDto {
  @ApiProperty({
    description: 'Correo electrónico institucional o número de registro del estudiante',
    example: 'juan@gmail.com',
  })
  @IsNotEmpty({
    message: 'El correo electrónico o número de registro es obligatorio',
  })
  @IsString({
    message: 'El identificador debe ser una cadena de texto',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  identifier: string;
}
