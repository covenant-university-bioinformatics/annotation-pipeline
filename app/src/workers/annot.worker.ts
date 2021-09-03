import { SandboxedJob } from 'bullmq';
import * as fs from 'fs';
import {
  AnnotationJobsDoc,
  JobStatus,
  AnnotationJobsModel,
} from '../jobs/models/annotation.jobs.model';
import {
  AnnotationDoc,
  AnnotationModel,
} from '../jobs/models/annotation.model';
import { spawn, spawnSync } from 'child_process';
import connectDB from '../mongoose';

import { fileOrPathExists } from '../utils/utilityfunctions';
function sleep(ms) {
  console.log('sleeping');
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getJobParameters(parameters: AnnotationDoc) {
  return [
    String(parameters.gene_db),
    String(parameters.cytoband),
    String(parameters.kgp_all),
    String(parameters.kgp_afr),
    String(parameters.kgp_amr),
    String(parameters.kgp_eas),
    String(parameters.kgp_eur),
    String(parameters.kgp_sas),
    String(parameters.exac),
    String(parameters.disgenet),
    String(parameters.clinvar),
    String(parameters.intervar),
  ];
}

export default async (job: SandboxedJob) => {
  //executed for each job
  console.log(
    'Worker ' +
      ' processing job ' +
      JSON.stringify(job.data.jobId) +
      ' Job name: ' +
      JSON.stringify(job.data.jobName),
  );

  await connectDB();
  await sleep(2000);

  //fetch job parameters from database
  const parameters = await AnnotationModel.findOne({
    job: job.data.jobId,
  }).exec();
  const jobParams = await AnnotationJobsModel.findById(job.data.jobId).exec();

  //assemble job parameters
  const pathToInputFile = `${jobParams.inputFile}`;
  const pathToOutputDir = `/pv/analysis/${job.data.jobUID}/annotation/output`;
  const jobParameters = getJobParameters(parameters);
  jobParameters.unshift(pathToInputFile, pathToOutputDir);
  // console.log(jobParameters);
  console.log(jobParameters);
  //make output directory
  fs.mkdirSync(pathToOutputDir, { recursive: true });

  // save in mongo database
  await AnnotationJobsModel.findByIdAndUpdate(
    job.data.jobId,
    {
      status: JobStatus.RUNNING,
    },
    { new: true },
  );

  //spawn process
  const start = Date.now();
  const jobSpawn = spawnSync(
    './pipeline_scripts/annotation_script-1.sh',
    jobParameters,
    // { detached: true },
  );

  console.log('Spawn command log');
  console.log(jobSpawn?.stdout?.toString());
  console.log('=====================================');
  console.log('Spawn error log');
  const error_msg = jobSpawn?.stderr?.toString();
  console.log(error_msg);

  const annot = await fileOrPathExists(
    `${pathToOutputDir}/annotation_output.hg19_multianno_full.tsv`,
  );

  let disgenet = true;

  if (jobParams.disgenet) {
    disgenet = false;
    disgenet = await fileOrPathExists(`${pathToOutputDir}/disgenet.txt`);
  }

  if (annot && disgenet) {
    console.log(`${job?.data?.jobName} spawn done!`);
    return true;
  } else {
    throw new Error(error_msg || 'Job failed to successfully complete');
  }

  // console.log(jobSpawn);
  //makes parent exits independently of the spawn
  // jobSpawn.unref();

  // console.log(`${job.data.jobName}` + ' Spawn with pid ', jobSpawn.pid);

  // let errorInfo = '';

  // jobSpawn.stdout.on('data', (data) => {
  //   // console.log(`stdout ${job.data.jobName}: ${data}`);
  //   // errorInfo = errorInfo + data + '\n';
  // });
  //
  // jobSpawn.stderr.on('data', (data) => {
  //   // console.log(`stderr: ${data}`);
  //   // errorInfo = errorInfo + data + '\n';
  // });
  //
  // jobSpawn.on('error', (error) => {
  //   console.log(`error: ${error.message}`);
  // });
  //
  // jobSpawn.on('close', async (code) => {});
  //
  // jobSpawn.on('exit', async (code, signal) => {
  //   // if (jobSpawn) {
  //   //   jobSpawn.kill();
  //   // }
  //   console.log('Exit ', code, signal);
  //   // console.log(`${job.data.jobName}` + ' Spawn with pid ', jobSpawn.pid, ' killed');
  //   // process.kill(-jobSpawn.pid);
  //
  //   const timeUsed = Date.now() - start;
  //
  //   console.log(
  //     `${job.data.jobName}, time: ${timeUsed} ,child process exited with code ${code}`,
  //   );
  //
  //   if (code === 0) {
  //     console.log('Job completed successfully');
  //
  //     // save in mongo database
  //     // job is complete
  //     await AnnotationJobsModel.findByIdAndUpdate(
  //       job.data.jobId,
  //       {
  //         status: JobStatus.COMPLETED,
  //         outputFile: `${pathToOutputDir}/annotation_output.hg19_multianno_full.tsv`,
  //         ...(parameters.disgenet === 'true' && {
  //           disgenet: `${pathToOutputDir}/disgenet.txt`,
  //         }),
  //         snp_plot: `${pathToOutputDir}/snp_plot.jpg`,
  //       },
  //       { new: true },
  //     );
  //     console.log(
  //       `${job.data.jobName}` + ' Spawn with pid ',
  //       jobSpawn.pid,
  //       ' killed',
  //     );
  //     workerController.decrementRunningJob();
  //     console.log(
  //       job.data.jobName + ' end running Jobs ',
  //       workerController.runningJob,
  //     );
  //     // process.kill(-jobSpawn.pid);
  //     jobSpawn.kill();
  //   } else if (code === null) {
  //     console.log('Job aborted successfully: ');
  //     await AnnotationJobsModel.findByIdAndUpdate(
  //       job.data.jobId,
  //       {
  //         status: JobStatus.ABORTED,
  //         timeUsed,
  //       },
  //       { new: true },
  //     );
  //     console.log(
  //       `${job.data.jobName}` + ' Spawn with pid ',
  //       jobSpawn.pid,
  //       ' killed',
  //     );
  //     workerController.decrementRunningJob();
  //     console.log(
  //       job.data.jobName + ' end running Jobs ',
  //       workerController.runningJob,
  //     );
  //     // process.kill(-jobSpawn.pid);
  //     jobSpawn.kill();
  //   } else {
  //     console.log('Failed ');
  //     console.log(errorInfo);
  //     // save in mongo database
  //     // job is complete
  //     await AnnotationJobsModel.findByIdAndUpdate(
  //       job.data.jobId,
  //       {
  //         status: JobStatus.FAILED,
  //         timeUsed,
  //       },
  //       { new: true },
  //     );
  //     console.log(
  //       `${job.data.jobName}` + ' Spawn with pid ',
  //       jobSpawn.pid,
  //       ' killed',
  //     );
  //     workerController.decrementRunningJob();
  //     console.log(
  //       job.data.jobName + ' end running Jobs ',
  //       workerController.runningJob,
  //     );
  //     // process.kill(-jobSpawn.pid);
  //     jobSpawn.kill();
  //   }
  // });

  return true;
};
