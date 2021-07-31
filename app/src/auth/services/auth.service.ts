import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../models/user.model';
import { Model } from 'mongoose';
import { NewUserDto } from '../../nats/dto/new-user.dto';
import { UserUpdatedDto } from '../../nats/dto/userUpdated.dto';
import { UserDeletedDto } from '../../nats/dto/userDeleted.dto';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async register(newUserDto: NewUserDto): Promise<{ success: boolean }> {
    const session = await this.userModel.startSession();
    session.startTransaction();
    try {
      const opts = { session };

      const user = await this.userModel.create(newUserDto);

      await user.save(opts);

      await session.commitTransaction();
      return {
        success: true,
      };
    } catch (e) {
      console.log(e);
      if (e.code === 11000) {
        throw new ConflictException(
          'Username/Email already exists: ' + e.message,
        );
      }
      await session.abortTransaction();
      throw new HttpException(e.message, 400);
    } finally {
      session.endSession();
    }
  }

  async findAll() {
    return this.userModel.find();
  }

  async findOne(id: string) {
    const user = await this.userModel.findOne({ _id: id });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async update(userUpdatedDto: UserUpdatedDto) {
    const oldUser = await this.userModel.findOne({
      username: userUpdatedDto.oldUsername,
    });

    if (userUpdatedDto.username) {
      oldUser.username = userUpdatedDto.username;
    }

    if (userUpdatedDto.email) {
      oldUser.email = userUpdatedDto.email;
    }

    if (userUpdatedDto.emailConfirmed) {
      oldUser.emailConfirmed = userUpdatedDto.emailConfirmed;
    }

    try {
      await oldUser.save();
      return { success: true };
    } catch (e) {
      console.log('Error: ', e);
    }

    return { success: false };
  }

  async emailConfirmChange(emailConfirmChange: {
    username: string;
    email: string;
    emailConfirmed: boolean;
  }) {
    const user = await this.userModel.findOne({
      username: emailConfirmChange.username,
    });

    user.emailConfirmed = emailConfirmChange.emailConfirmed;

    try {
      await user.save();
      return { success: true };
    } catch (e) {
      console.log('Error: ', e);
    }
  }

  async remove(userDeleteDto: UserDeletedDto) {
    try {
      this.userModel.deleteOne({
        username: userDeleteDto.username,
        email: userDeleteDto.email,
      });
      return { success: true };
    } catch (e) {
      console.log(e);
    }
  }
}
