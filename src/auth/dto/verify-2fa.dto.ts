import { IsMongoId, Matches } from 'class-validator';

export class VerifyTwoFactorDto {
  @IsMongoId()
  userId!: string;

  @Matches(/^\d{6}$/, {
    message: 'Two-factor token must be a 6 digit code.',
  })
  token!: string;
}
