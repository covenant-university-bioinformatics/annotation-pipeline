import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from './jwt-payload.interface';
import { User, UserDocument } from './models/user.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

//ExtractJwt.fromAuthHeaderAsBearerToken()

//This file handles the extraction of jwt token from cookie or header and
//Validating the jwt token

const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['accessToken'];
  }
  return token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private logger: Logger;
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
    super({
      jwtFromRequest: cookieExtractor,
      secretOrKey: process.env.JWT_KEY,
    });
    this.logger = new Logger();
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { username } = payload;
    const user = await this.userModel.findOne({ username });

    if (!user) {
      this.logger.error(`Username not found: ${username}`);
      throw new UnauthorizedException();
    }

    return user;
  }
}
