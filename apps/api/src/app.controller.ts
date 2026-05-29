import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class AppController {
  @Get('health')
  @ApiOperation({ summary: 'Проверка доступности API' })
  @ApiOkResponse({
    schema: { example: { status: 'ok' } },
  })
  health() {
    return { status: 'ok' };
  }
}
