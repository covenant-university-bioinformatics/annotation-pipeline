import config from '../config/bullmq.config';
import { WorkerJob } from '../jobqueue/queue/annot.queue';
import { Worker, Job, QueueScheduler } from 'bullmq';
import { DeletJobsModel, JobStatus } from '../jobs/models/delet.jobs.model';
import * as path from 'path';

let scheduler;

const createDeletScheduler = () => {
  scheduler = new QueueScheduler(config.queueDeletName, {
    connection: config.connection,
    // maxStalledCount: 10,
    // stalledInterval: 15000,
  });
};

const processorFile = path.join(__dirname, 'delet.worker.js');
const numWorkers = 1;
export const createDeletWorkers = async () => {
  createDeletScheduler();

  for (let i = 0; i < numWorkers; i++) {
    console.log('Creating Delet worker ' + i);

    const worker = new Worker<WorkerJob>(config.queueDeletName, processorFile, {
      connection: config.connection,
      // concurrency: config.concurrency,
      limiter: config.limiter,
    });

    worker.on('completed', async (job: Job, returnvalue: any) => {
      console.log('worker ' + i + ' completed ' + returnvalue);

      // save in mongo database
      // job is complete

      // const jobParams = await AnnotationJobsModel.findById(job.data.jobId).exec();
      const pathToOutputDir = `/pv/analysis/${job.data.jobUID}/deleteriousness/output`;
      await DeletJobsModel.findByIdAndUpdate(
        job.data.jobId,
        {
          status: JobStatus.COMPLETED,
          outputFile: `${pathToOutputDir}/deleteriousness_output.hg19_multianno_full.tsv`,
          exon_plot: `${pathToOutputDir}/exon_plot.jpg`,
          completionTime: new Date(),
        },
        { new: true },
      );
    });

    worker.on('failed', async (job: Job) => {
      console.log('worker ' + i + ' failed ' + job.failedReason);
      //update job in database as failed
      //save in mongo database
      await DeletJobsModel.findByIdAndUpdate(
        job.data.jobId,
        {
          status: JobStatus.FAILED,
          failed_reason: job.failedReason,
          completionTime: new Date(),
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
