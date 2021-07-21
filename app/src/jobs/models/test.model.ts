import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { Jobs } from './jobs.models';

export type TestDocument = Test & Document;

@Schema({
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  },
  timestamps: true,
})
export class Test {
  @Prop({
    type: Number,
    required: [true, 'Please add number of columns'],
  })
  numLines: number;

  @Prop({
    type: Number,
    required: [true, 'Please add number of seconds'],
  })
  numSeconds: number;

  // @Prop({
  //   type: String,
  //   required: [true, 'Please add a output folder'],
  //   unique: true,
  //   trim: true,
  // })
  // outputDir: string;
  //
  // @Prop({
  //   type: String,
  //   required: [true, 'Please add a input filename'],
  //   unique: true,
  //   trim: true,
  // })
  // inputFile: string;

  @Prop({
    type: String,
    trim: true,
  })
  textfile: string;

  version: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Jobs',
    required: true,
  })
  job: Jobs;
}

export const TestSchema = SchemaFactory.createForClass(Test);

TestSchema.set('versionKey', 'version');
