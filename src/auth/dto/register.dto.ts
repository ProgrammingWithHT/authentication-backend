import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @Transform(({ value }) => String(value).trim().toLowerCase())
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  @Matches(/^[a-z0-9._-]+$/, {
    message:
      'Username can only contain lowercase letters, numbers, dots, underscores, and hyphens.',
  })
  username!: string;

  @Transform(({ value }) => String(value).trim().toLowerCase())
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
