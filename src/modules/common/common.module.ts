import { Module, ParseIntPipe, ValidationPipe } from '@nestjs/common';

@Module({
  providers: [ValidationPipe, ParseIntPipe],
  exports: [ValidationPipe, ParseIntPipe],
})
export class CommonModule {}
