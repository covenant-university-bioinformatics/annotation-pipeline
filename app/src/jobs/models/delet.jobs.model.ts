import * as mongoose from 'mongoose';
import { UserDoc } from '../../auth/models/user.model';

export enum JobStatus {
  COMPLETED = 'completed',
  RUNNING = 'running',
  FAILED = 'failed',
  ABORTED = 'aborted',
  NOTSTARTED = 'not-started',
  QUEUED = 'queued',
}

export enum GeneAnnot {
  UCSC = 'ucsc',
  ENSEMBL = 'ensembl',
  REFSEQ = 'refseq',
}

//Interface that describe the properties
// that are required to create a new job
interface JobsAttrs {
  jobUID: string;
  job_name: string;
  status: JobStatus;
  user?: string;
  email?: string;
  inputFile: string;
  gene_db: GeneAnnot;
  useTest: string;
  marker_name: string;
  chromosome: string;
  position: string;
  effect_allele: string;
  alternate_allele: string;
  longJob: boolean;
}

// An interface that describes the extra properties that a model has
//collection level methods
interface JobsModel extends mongoose.Model<DeletJobsDoc> {
  build(attrs: JobsAttrs): DeletJobsDoc;
}

//An interface that describes a properties that a document has
export interface DeletJobsDoc extends mongoose.Document {
  id: string;
  jobUID: string;
  job_name: string;
  inputFile: string;
  status: JobStatus;
  user?: UserDoc;
  email?: string;
  outputFile: string;
  exon_plot: string;
  failed_reason: string;
  gene_db: GeneAnnot;
  useTest: boolean;
  marker_name: number;
  chromosome: number;
  position: number;
  effect_allele: number;
  alternate_allele: number;
  version: number;
  completionTime: Date;
  longJob: boolean;
}

const DeletJobSchema = new mongoose.Schema<DeletJobsDoc, JobsModel>(
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
    email: {
      type: String,
      trim: true,
    },
    inputFile: {
      type: String,
      required: [true, 'Please add a input filename'],
      trim: true,
    },
    outputFile: {
      type: String,
      trim: true,
    },
    exon_plot: {
      type: String,
      trim: true,
    },
    failed_reason: {
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
    completionTime: {
      type: Date,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    gene_db: {
      type: String,
      enum: [GeneAnnot.ENSEMBL, GeneAnnot.REFSEQ, GeneAnnot.UCSC],
      default: GeneAnnot.REFSEQ,
    },
    useTest: {
      type: Boolean,
      trim: true,
    },
    marker_name: {
      type: Number,
      trim: true,
    },
    chromosome: {
      type: Number,
      trim: true,
    },
    position: {
      type: Number,
      trim: true,
    },
    effect_allele: {
      type: Number,
      trim: true,
    },
    alternate_allele: {
      type: Number,
      trim: true,
    },
    longJob: {
      type: Boolean,
      default: false,
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

//collection level methods
DeletJobSchema.statics.build = (attrs: JobsAttrs) => {
  return new DeletJobsModel(attrs);
};

//increments version when document updates
DeletJobSchema.set('versionKey', 'version');

//create mongoose model
const DeletJobsModel = mongoose.model<DeletJobsDoc, JobsModel>(
  'DeletJob',
  DeletJobSchema,
  // 'deleteriousnessjobs',
);

export { DeletJobsModel };
