import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @Transform(({ value }) => String(value).trim().toLowerCase())
  @IsString()
  @MinLength(3)
  @MaxLength(320)
  usernameOrEmail!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
