import * as mongoose from 'mongoose';
import { UserDoc } from '../../auth/models/user.model';
import { AnnotationDoc } from './annotation.model';

export enum JobStatus {
  COMPLETED = 'completed',
  RUNNING = 'running',
  FAILED = 'failed',
  ABORTED = 'aborted',
  NOTSTARTED = 'not-started',
  QUEUED = 'queued',
}

//Interface that describe the properties that are required to create a new job
interface JobsAttrs {
  jobUID: string;
  job_name: string;
  status: JobStatus;
  user: string;
  inputFile: string;
}

// An interface that describes the extra properties that a model has
//collection level methods
interface JobsModel extends mongoose.Model<AnnotationJobsDoc> {
  build(attrs: JobsAttrs): Promise<AnnotationJobsDoc>;
}

//An interface that describes a properties that a document has
export interface AnnotationJobsDoc extends mongoose.Document {
  id: string;
  jobUID: string;
  job_name: string;
  inputFile: string;
  status: JobStatus;
  user: UserDoc;
  outputFile: string;
  disgenet: string;
  snp_plot: string;
  annot: AnnotationDoc;
  version: number;
}

const AnnotationJobSchema = new mongoose.Schema<AnnotationJobsDoc, JobsModel>(
  {
    jobUID: {
      type: String,
      required: [true, 'Please add a Job UID'],
      unique: true,
      trim: true,
    },

    job_name: {
      type: String,
      required: [true, 'Please add a name'],
    },

    inputFile: {
      type: String,
      required: [true, 'Please add a input filename'],
      unique: true,
      trim: true,
    },

    outputFile: {
      type: String,
      trim: true,
    },

    disgenet: {
      type: String,
      trim: true,
    },

    snp_plot: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        JobStatus.COMPLETED,
        JobStatus.NOTSTARTED,
        JobStatus.RUNNING,
        JobStatus.FAILED,
        JobStatus.ABORTED,
        JobStatus.QUEUED,
      ],
      default: JobStatus.NOTSTARTED,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    version: {
      type: Number,
    },
  },
  {
    timestamps: true,
    versionKey: 'version',
    toObject: { virtuals: true },
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        // delete ret._id;
        // delete ret.__v;
      },
    },
  },
);

//increments version when document updates
// jobsSchema.set("versionKey", "version");

//collection level methods
AnnotationJobSchema.statics.build = async (attrs: JobsAttrs) => {
  return await AnnotationJobsModel.create(attrs);
};

//Cascade delete main job parameters when job is deleted
AnnotationJobSchema.pre('remove', async function (next) {
  console.log('Job parameters being removed!');
  await this.model('Annotation').deleteMany({
    job: this.id,
  });
  next();
});

//reverse populate jobs with main job parameters
AnnotationJobSchema.virtual('annot', {
  ref: 'Annotation',
  localField: '_id',
  foreignField: 'job',
  required: true,
  justOne: true,
});

AnnotationJobSchema.set('versionKey', 'version');

//create mongoose model
const AnnotationJobsModel = mongoose.model<AnnotationJobsDoc, JobsModel>(
  'AnnotationJob',
  AnnotationJobSchema,
  'annotationjobs',
);

export { AnnotationJobsModel };
