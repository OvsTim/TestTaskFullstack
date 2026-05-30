import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({
    example: 'Ошибка валидации данных',
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    description: 'Описание ошибки или список ошибок валидации',
  })
  message!: string | string[];

  @ApiProperty({ example: 'Bad Request' })
  error!: string;
}
