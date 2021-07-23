import config from '../config/bullmq.config';
import { WorkerJob } from '../jobqueue/queue';
import { Worker, Job, QueueScheduler } from 'bullmq';
import {
  AnnotationJob,
  AnnotationJobDocument,
  JobStatus,
} from '../jobs/models/annotation.jobs.models';
import { Model } from 'mongoose';
import { spawn } from 'child_process';
import * as fs from 'fs';

export const createScheduler = () => {
  const scheduler = new QueueScheduler(config.queueName, {
    connection: config.connection,
  });
};

export enum AnalysisStatus {
  QUEUED = 'queued',
  RUNNING = 'running',
  FAILED = 'failed',
  COMPLETED = 'completed',
  ABORTED = 'aborted',
}

function getJobParameters(parameters: any) {
  return [
    parameters.annot.cytoband,
    parameters.annot.all_1000g,
    parameters.annot.afr_1000g,
    parameters.annot.amr_1000g,
    parameters.annot.eas_1000g,
    parameters.annot.eur_1000g,
    parameters.annot.sas_1000g,
    parameters.annot.exac,
    parameters.annot.dbnsfp,
    parameters.annot.clinvar,
    parameters.annot.intervar,
  ];
}

export const createWorkers = async (dbModel: Model<AnnotationJobDocument>) => {
  for (let i = 0; i < config.numWorkers; i++) {
    console.log('Creating worker ' + i);
    const worker = new Worker<WorkerJob>(
      config.queueName,
      async (job: Job<WorkerJob>) => {
        //executed for each job
        console.log(
          'Worker ' +
            i +
            ' processing job ' +
            JSON.stringify(job.data.jobId) +
            ' Job name: ' +
            JSON.stringify(job.data.jobName),
        );

        //fetch job parameters from database
        const parameters = await dbModel
          .findById(job.data.jobId)
          .populate('annot')
          .exec();
        console.log(parameters);

        //assemble job parameters
        const pathToInputFile = `${parameters.inputFile}`;
        const pathToOutputDir = `/pv/analysis/${job.data.jobUID}/annotation/output`;
        const jobParameters = getJobParameters(parameters);
        jobParameters.unshift(pathToInputFile, pathToOutputDir);
        console.log(jobParameters);
        fs.mkdirSync(pathToOutputDir, { recursive: true });
        // save in mongo database
        await dbModel.findByIdAndUpdate(
          job.data.jobId,
          {
            status: JobStatus.RUNNING,
          },
          { new: true },
        );

        //spawn process
        const start = Date.now();
        const jobSpawn = spawn('./annotation_script-1.sh', jobParameters);

        jobSpawn.stdout.on('data', (data) => {
          console.log(`stdout ${job.data.jobName}: ${data}`);
        });

        jobSpawn.stderr.on('data', (data) => {
          console.log(`stderr: ${data}`);
        });

        jobSpawn.on('error', (error) => {
          console.log(`error: ${error.message}`);
        });

        jobSpawn.on('close', async (code) => {
          console.log(
            `${job.data.jobName}, time: ${
              Date.now() - start
            } ,child process exited with code ${code}`,
          );
          if (code === 0) {
            console.log('Job completed successfully');
          } else if (code === null) {
            console.log('Job aborted successfully: ');
          } else {
            console.log('Closed ');
          }
        });

        return true;
      },
      {
        connection: config.connection,
        concurrency: config.concurrency,
        limiter: config.limiter,
      },
    );

    worker.on('completed', (job: Job, returnvalue: any) => {
      console.log('worker ' + i + ' completed ' + returnvalue);
    });

    worker.on('failed', async (job: Job) => {
      console.log('worker ' + i + ' failed ' + job.failedReason);
      //update job in database as failed
      //save in mongo database
      // await dbModel.findByIdAndUpdate(
      //   job.data.jobId,
      //   {
      //     status: JobStatus.FAILED,
      //   },
      //   { new: true },
      // );
    });

    console.log('Worker ' + i + ' created');
  }
};
