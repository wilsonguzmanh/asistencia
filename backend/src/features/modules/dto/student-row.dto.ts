import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class StudentRowDto {
  @ApiProperty({
    example: '1001',
    description: 'Número de registro o matrícula única del estudiante en el módulo',
  })
  @IsString({ message: 'El número de registro debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El número de registro es obligatorio' })
  registrationNumber: string;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo del estudiante',
  })
  @IsString({ message: 'El nombre completo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
  fullName: string;

  @ApiProperty({
    example: 'juan@gmail.com',
    description: 'Correo electrónico válido del estudiante',
  })
  @IsEmail({}, { message: 'El formato de correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string;

  @ApiProperty({
    example: 2,
    description: 'Número de fila en el archivo Excel origen',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  rowNumber?: number;
}
