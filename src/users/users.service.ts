import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RegisterDto } from '../auth/dto/register.dto';
import { User, UserDocument } from './schemas/user.schema';

export interface SafeUser {
  id: string;
  username: string;
  email: string;
  isTwoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface UserLookupOptions {
  includePassword?: boolean;
  includeTwoFactorSecret?: boolean;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(registerDto: RegisterDto, hashedPassword: string) {
    const user = new this.userModel({
      ...registerDto,
      password: hashedPassword,
    });

    try {
      return await user.save();
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        this.logger.warn(
          `Duplicate user creation attempt for "${registerDto.email}" or "${registerDto.username}".`,
        );
        throw new ConflictException(
          'A user with that email or username already exists.',
        );
      }

      throw error;
    }
  }

  async findByIdentifier(
    identifier: string,
    options: UserLookupOptions = {},
  ): Promise<UserDocument | null> {
    const query = this.userModel.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    this.applySensitiveFieldSelection(query, options);

    return query.exec();
  }

  async findById(
    userId: string,
    options: UserLookupOptions = {},
  ): Promise<UserDocument | null> {
    const query = this.userModel.findById(userId);

    this.applySensitiveFieldSelection(query, options);

    return query.exec();
  }

  async assertUniqueCredentials(email: string, username: string) {
    const existingUsers = await this.userModel
      .find({
        $or: [{ email }, { username }],
      })
      .select('email username')
      .lean()
      .exec();

    if (existingUsers.some((user) => user.email === email)) {
      throw new ConflictException('Email is already in use.');
    }

    if (existingUsers.some((user) => user.username === username)) {
      throw new ConflictException('Username is already in use.');
    }
  }

  async getExistingUserOrFail(userId: string, options: UserLookupOptions = {}) {
    const user = await this.findById(userId, options);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  sanitizeUser(user: UserDocument): SafeUser {
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private applySensitiveFieldSelection(
    query:
      | ReturnType<Model<UserDocument>['findOne']>
      | ReturnType<Model<UserDocument>['findById']>,
    options: UserLookupOptions,
  ) {
    const fields = [
      options.includePassword ? '+password' : null,
      options.includeTwoFactorSecret ? '+twoFactorSecret' : null,
    ].filter((field): field is string => field !== null);

    if (fields.length > 0) {
      query.select(fields.join(' '));
    }
  }

  private isDuplicateKeyError(error: unknown): error is { code: number } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof error.code === 'number' &&
      error.code === 11000
    );
  }
}
