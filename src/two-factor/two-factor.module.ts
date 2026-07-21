import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '../common/common.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersModule } from '../users/users.module';
import { TwoFactorController } from './two-factor.controller';
import { TwoFactorService } from './two-factor.service';

@Module({
  imports: [ConfigModule, CommonModule, UsersModule],
  controllers: [TwoFactorController],
  providers: [TwoFactorService, JwtAuthGuard],
  exports: [TwoFactorService],
})
export class TwoFactorModule {}
