import * as mongoose from 'mongoose';
import { AnnotationJobsDoc } from './annotation.jobs.model';

//Interface that describe the properties that are required to create a new job
interface AnnotationAttrs {
  cytoband: string;
  kgp_all: string;
  kgp_afr: string;
  kgp_amr: string;
  kgp_eas: string;
  kgp_eur: string;
  kgp_sas: string;
  exac: string;
  disgenet: string;
  clinvar: string;
  intervar: string;
  job: string;
}

// An interface that describes the extra properties that a ticket model has
//collection level methods
interface AnnotationModel extends mongoose.Model<AnnotationDoc> {
  build(attrs: AnnotationAttrs): Promise<AnnotationDoc>;
}

//An interface that describes a properties that a document has
export interface AnnotationDoc extends mongoose.Document {
  id: string;
  version: number;
  cytoband: boolean;
  kgp_all: boolean;
  kgp_afr: boolean;
  kgp_amr: boolean;
  kgp_eas: boolean;
  kgp_eur: boolean;
  kgp_sas: boolean;
  exac: boolean;
  disgenet: boolean;
  clinvar: boolean;
  intervar: boolean;
}

const AnnotationSchema = new mongoose.Schema(
  {
    cytoband: {
      type: Boolean,
      default: false,
    },
    kgp_all: {
      type: Boolean,
      default: false,
    },
    kgp_afr: {
      type: Boolean,
      default: false,
    },
    kgp_amr: {
      type: Boolean,
      default: false,
    },
    kgp_eas: {
      type: Boolean,
      default: false,
    },
    kgp_eur: {
      type: Boolean,
      default: false,
    },
    kgp_sas: {
      type: Boolean,
      default: false,
    },
    exac: {
      type: Boolean,
      default: false,
    },
    disgenet: {
      type: Boolean,
      default: false,
    },
    clinvar: {
      type: Boolean,
      default: false,
    },
    intervar: {
      type: Boolean,
      default: false,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AnnotationJob',
      required: true,
    },
    version: {
      type: Number,
    },
  },
  {
    timestamps: true,
    versionKey: 'version',
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        // delete ret._id;
        // delete ret.__v;
      },
    },
  },
);

//increments version when document updates
AnnotationSchema.set('versionKey', 'version');

//collection level methods
AnnotationSchema.statics.build = async (attrs: AnnotationAttrs) => {
  return await AnnotationModel.create(attrs);
};

//create mongoose model
const AnnotationModel = mongoose.model<AnnotationDoc, AnnotationModel>(
  'Annotation',
  AnnotationSchema,
  'annotations',
);

export { AnnotationModel };
