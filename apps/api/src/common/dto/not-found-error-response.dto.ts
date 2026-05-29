import { ApiProperty } from '@nestjs/swagger';

export class NotFoundErrorResponseDto {
  @ApiProperty({ example: 404 })
  statusCode!: number;

  @ApiProperty({ example: 'Work entry clxyz1234567890 not found' })
  message!: string;

  @ApiProperty({ example: 'Not Found' })
  error!: string;
}
