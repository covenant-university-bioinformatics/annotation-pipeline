import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { AnnotationJob } from './annotation.jobs.models';

export type AnnotationDocument = Annotation & Document;

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
export class Annotation {
  @Prop({
    type: Boolean,
    default: false,
  })
  cytoband: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  all_1000g: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  afr_1000g: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  amr_1000g: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  eas_1000g: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  eur_1000g: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  sas_1000g: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  exac: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  dbnsfp: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  clinvar: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  intervar: string;

  version: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AnnotationJob',
    required: true,
  })
  job: AnnotationJob;
}

export const AnnotationSchema = SchemaFactory.createForClass(Annotation);

AnnotationSchema.set('versionKey', 'version');
