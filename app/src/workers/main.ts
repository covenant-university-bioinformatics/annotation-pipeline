import config from '../config/bullmq.config';
import { WorkerJob } from '../jobqueue/queue';
import { Worker, Job, QueueScheduler } from 'bullmq';
import {
  AnnotationJobsModel,
  JobStatus,
} from '../jobs/models/annotation.jobs.model';
import * as path from 'path';
import { AnnotationModel } from '../jobs/models/annotation.model';

let scheduler;

const createScheduler = () => {
  scheduler = new QueueScheduler(config.queueName, {
    connection: config.connection,
    // maxStalledCount: 10,
    // stalledInterval: 15000,
  });
};

export var runningJobs = {
  value: 0,
};

const processorFile = path.join(__dirname, 'worker.js');

export const createWorkers = async () => {
  createScheduler();
  for (let i = 0; i < config.numWorkers; i++) {
    console.log('Creating worker ' + i);

    const worker = new Worker<WorkerJob>(config.queueName, processorFile, {
      connection: config.connection,
      // concurrency: config.concurrency,
      limiter: config.limiter,
    });

    worker.on('completed', async (job: Job, returnvalue: any) => {
      console.log('worker ' + i + ' completed ' + returnvalue);

      // save in mongo database
      // job is complete
      const parameters = await AnnotationModel.findOne({
        job: job.data.jobId,
      }).exec();

      // const jobParams = await AnnotationJobsModel.findById(job.data.jobId).exec();
      const pathToOutputDir = `/pv/analysis/${job.data.jobUID}/annotation/output`;
      await AnnotationJobsModel.findByIdAndUpdate(
        job.data.jobId,
        {
          status: JobStatus.COMPLETED,
          outputFile: `${pathToOutputDir}/annotation_output.hg19_multianno_full.tsv`,
          ...(parameters.disgenet === true && {
            disgenet: `${pathToOutputDir}/disgenet.txt`,
          }),
          snp_plot: `${pathToOutputDir}/snp_plot.jpg`,
        },
        { new: true },
      );
    });

    worker.on('failed', async (job: Job) => {
      console.log('worker ' + i + ' failed ' + job.failedReason);
      //update job in database as failed
      //save in mongo database
      await AnnotationJobsModel.findByIdAndUpdate(
        job.data.jobId,
        {
          status: JobStatus.FAILED,
        },
        { new: true },
      );
    });

    // worker.on('close', () => {
    //   console.log('worker ' + i + ' closed');
    // });

    process.on('SIGINT', () => {
      worker.close();
      console.log('worker ' + i + ' closed');
    });

    process.on('SIGTERM', () => {
      worker.close();
      console.log('worker ' + i + ' closed');
    });

    process.on('SIGBREAK', () => {
      worker.close();
      console.log('worker ' + i + ' closed');
    });

    console.log('Worker ' + i + ' created');
  }
};
