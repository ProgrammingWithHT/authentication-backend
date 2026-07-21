import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EnableTwoFactorDto } from './dto/enable-two-factor.dto';
import { TwoFactorService } from './two-factor.service';

@Controller('2fa')
@UseGuards(JwtAuthGuard)
export class TwoFactorController {
  constructor(private readonly twoFactorService: TwoFactorService) {}

  @Post('generate')
  generate(@CurrentUser() currentUser: JwtPayload) {
    return this.twoFactorService.generateSetup(currentUser.sub);
  }

  @Post('enable')
  enable(
    @CurrentUser() currentUser: JwtPayload,
    @Body() enableTwoFactorDto: EnableTwoFactorDto,
  ) {
    return this.twoFactorService.enableForUser(
      currentUser.sub,
      enableTwoFactorDto.token,
    );
  }
}
