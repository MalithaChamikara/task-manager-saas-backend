import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schema/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  // Create a new user with the given email and password hash
  async create(email: string, passwordHash: string): Promise<User> {
    const user = await this.userModel.create({
      email,
      passwordHash,
    });
    return user;
  }

  // Find a user by their ID
  async findById(userId: string): Promise<User | null> {
    return this.userModel.findById(userId).exec();
  }

  // Find a user by their email
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  // Find a user by their email and include the password hash in the result
  async findByEmailWithPassword(
    email: string,
  ): Promise<(User & { passwordHash: string }) | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase().trim() })
      .select('+passwordHash')
      .exec() as any;
  }

  // Find a user by their ID and include the refresh token hash in the result
  async findByIdWithRefreshHash(
    userId: string,
  ): Promise<(User & { refreshTokenHash: string | null }) | null> {
    return this.userModel
      .findById(userId)
      .select('+refreshTokenHash')
      .exec() as any;
  }

  // Set the refresh token hash for a user
  async setRefreshTokenHash(
    userId: string,
    refreshTokenHash: string | null,
  ): Promise<void> {
    await this.userModel.updateOne(
      { _id: userId },
      {
        $set: { refreshTokenHash },
      },
    );
  }
}
