import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { TwoFactorService } from '../two-factor/two-factor.service';
import { SafeUser, UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyTwoFactorDto } from './dto/verify-2fa.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly saltRounds: number;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly twoFactorService: TwoFactorService,
  ) {
    this.saltRounds =
      this.configService.getOrThrow<number>('BCRYPT_SALT_ROUNDS');
  }

  async register(registerDto: RegisterDto) {
    await this.usersService.assertUniqueCredentials(
      registerDto.email,
      registerDto.username,
    );

    const hashedPassword = await bcrypt.hash(
      registerDto.password,
      this.saltRounds,
    );
    const user = await this.usersService.create(registerDto, hashedPassword);

    this.logger.log(`User registered successfully: ${user._id.toString()}`);

    return {
      message: 'Registration successful.',
      user: this.usersService.sanitizeUser(user),
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByIdentifier(
      loginDto.usernameOrEmail,
      { includePassword: true },
    );

    if (!user?.password) {
      this.logger.warn(
        `Invalid login attempt for identifier "${loginDto.usernameOrEmail}".`,
      );
      throw new UnauthorizedException('Invalid credentials.');
    }

    const passwordMatches = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!passwordMatches) {
      this.logger.warn(
        `Invalid password attempt for user "${user._id.toString()}".`,
      );
      throw new UnauthorizedException('Invalid credentials.');
    }

    if (user.isTwoFactorEnabled) {
      this.logger.log(
        `Password verified. Awaiting 2FA verification for user "${user._id.toString()}".`,
      );

      return {
        requires2FA: true,
        userId: user._id.toString(),
      };
    }

    const accessToken = await this.signToken(user._id.toString(), {
      email: user.email,
      username: user.username,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
    });

    this.logger.log(`User logged in successfully: ${user._id.toString()}`);

    return {
      accessToken,
      user: this.usersService.sanitizeUser(user),
    };
  }

  async verifyTwoFactorLogin(verifyTwoFactorDto: VerifyTwoFactorDto) {
    const user = await this.twoFactorService.verifyLoginToken(
      verifyTwoFactorDto.userId,
      verifyTwoFactorDto.token,
    );

    const accessToken = await this.signToken(user._id.toString(), {
      email: user.email,
      username: user.username,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
    });

    this.logger.log(
      `Two-factor login completed successfully for user "${user._id.toString()}".`,
    );

    return { accessToken };
  }

  async getProfile(userId: string): Promise<SafeUser> {
    const user = await this.usersService.getExistingUserOrFail(userId);
    return this.usersService.sanitizeUser(user);
  }

  private async signToken(
    userId: string,
    user: Omit<JwtPayload, 'sub'>,
  ): Promise<string> {
    return this.jwtService.signAsync({
      sub: userId,
      ...user,
    });
  }
}
