import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum JobStatus {
  COMPLETED = 'completed',
  RUNNING = 'running',
  FAILED = 'failed',
  ABORTED = 'aborted',
  NOTSTARTED = 'not-started',
}
export type AnnotationJobDocument = AnnotationJob & Document;

@Schema({
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  },
  toObject: { virtuals: true },
  timestamps: true,
})
export class AnnotationJob {
  @Prop({
    type: String,
    required: [true, 'Please add a Job UID'],
    unique: true,
    trim: true,
  })
  jobUID: string;

  @Prop({
    type: String,
    required: [true, 'Please add a name'],
  })
  jobName: string;

  @Prop({
    type: String,
    required: [true, 'Please add a input filename'],
    unique: true,
    trim: true,
  })
  inputFile: string;

  @Prop({
    type: String,
    trim: true,
  })
  outputFile: string;

  @Prop({
    type: String,
    enum: [
      JobStatus.COMPLETED,
      JobStatus.NOTSTARTED,
      JobStatus.RUNNING,
      JobStatus.FAILED,
      JobStatus.ABORTED,
    ],
    default: JobStatus.NOTSTARTED,
  })
  status: JobStatus;

  version: number;
}

export const AnnotationJobSchema = SchemaFactory.createForClass(AnnotationJob);

//Cascade delete main job parameters when job is deleted
AnnotationJobSchema.pre('remove', async function (next) {
  console.log('Job parameters being removed!');
  await this.model('Test').deleteMany({
    job: this.id,
  });
  next();
});

//reverse populate jobs with main job parameters
AnnotationJobSchema.virtual('annot', {
  ref: 'Annotation',
  localField: '_id',
  foreignField: 'job',
  justOne: true,
});
AnnotationJobSchema.set('versionKey', 'version');
