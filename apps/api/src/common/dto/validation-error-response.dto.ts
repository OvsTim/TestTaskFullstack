import { ApiProperty } from '@nestjs/swagger';

export class ValidationErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({
    example: ['completedAt must be a valid ISO 8601 date string'],
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
  })
  message!: string | string[];

  @ApiProperty({ example: 'Bad Request' })
  error!: string;
}
