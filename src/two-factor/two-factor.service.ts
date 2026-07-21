import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { generateSecret, generateURI, verifySync } from 'otplib';
import * as QRCode from 'qrcode';
import { EncryptionService } from '../common/security/encryption.service';
import { UserDocument } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class TwoFactorService {
  private readonly logger = new Logger(TwoFactorService.name);
  private readonly appName: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly encryptionService: EncryptionService,
    private readonly configService: ConfigService,
  ) {
    this.appName =
      this.configService.get<string>('TWO_FACTOR_APP_NAME') ??
      'Authentication App';
  }

  async generateSetup(userId: string) {
    const user = await this.usersService.getExistingUserOrFail(userId, {
      includeTwoFactorSecret: true,
    });

    if (user.isTwoFactorEnabled) {
      throw new ConflictException(
        'Two-factor authentication is already enabled.',
      );
    }

    const secret = generateSecret();
    const encryptedSecret = this.encryptionService.encrypt(secret);
    const otpAuthUrl = generateURI({
      issuer: this.appName,
      label: user.email,
      secret,
    });
    const qrCode = await QRCode.toDataURL(otpAuthUrl);

    user.twoFactorSecret = encryptedSecret;
    await user.save();

    this.logger.log(`Generated 2FA setup for user "${user._id.toString()}".`);

    return {
      secret,
      qrCode,
    };
  }

  async enableForUser(userId: string, token: string) {
    const user = await this.usersService.getExistingUserOrFail(userId, {
      includeTwoFactorSecret: true,
    });

    if (user.isTwoFactorEnabled) {
      throw new ConflictException(
        'Two-factor authentication is already enabled.',
      );
    }

    if (!user.twoFactorSecret) {
      throw new BadRequestException(
        'Generate a two-factor secret before enabling 2FA.',
      );
    }

    const secret = this.encryptionService.decrypt(user.twoFactorSecret);
    const result = verifySync({ token, secret });
    const isValid = result.valid;

    if (!isValid) {
      this.logger.warn(
        `Invalid 2FA setup token submitted for user "${user._id.toString()}".`,
      );
      throw new UnauthorizedException(
        'Invalid two-factor authentication code.',
      );
    }

    user.isTwoFactorEnabled = true;
    await user.save();

    this.logger.log(`Enabled 2FA for user "${user._id.toString()}".`);

    return {
      message: 'Two-factor authentication enabled successfully.',
    };
  }

  async verifyLoginToken(userId: string, token: string): Promise<UserDocument> {
    const user = await this.usersService.getExistingUserOrFail(userId, {
      includeTwoFactorSecret: true,
    });

    if (!user.isTwoFactorEnabled || !user.twoFactorSecret) {
      throw new UnauthorizedException(
        'Two-factor authentication is not enabled.',
      );
    }

    const secret = this.encryptionService.decrypt(user.twoFactorSecret);
    const result = verifySync({ token, secret });
    const isValid = result.valid;

    if (!isValid) {
      this.logger.warn(
        `Invalid 2FA login token submitted for user "${user._id.toString()}".`,
      );
      throw new UnauthorizedException(
        'Invalid two-factor authentication code.',
      );
    }

    return user;
  }
}
