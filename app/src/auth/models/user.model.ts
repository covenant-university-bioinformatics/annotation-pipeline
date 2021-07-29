import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

export type UserDocument = User & Document;

export enum UserRoles {
  ADMIN = 'admin',
  SCIENTIST = 'scientist',
}

@Schema({
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  },
  timestamps: true,
  versionKey: 'version',
})
export class User {
  @Prop({
    type: String,
    required: [true, 'Please add a username'],
    unique: true,
    trim: true,
    minlength: [5, 'username must not be less than 5'],
    maxlength: [20, 'username must not be more than 20'],
  })
  username: string;

  @Prop({
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
  })
  email: string;

  @Prop({
    type: String,
    enum: [UserRoles.SCIENTIST, UserRoles.ADMIN],
    default: UserRoles.SCIENTIST,
  })
  role: UserRoles;

  @Prop()
  emailConfirmed: boolean;

  version: number;
}

export const UserSchema = SchemaFactory.createForClass(User);

//enable optimistic concurrency control
//set versionKey to version for occ to use version
UserSchema.set('versionKey', 'version');
UserSchema.plugin(updateIfCurrentPlugin);
