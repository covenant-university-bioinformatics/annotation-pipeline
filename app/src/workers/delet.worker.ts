import { SandboxedJob } from 'bullmq';
import * as fs from 'fs';
import {
  DeletJobsDoc,
  JobStatus,
  DeletJobsModel,
} from '../jobs/models/delet.jobs.model';
import { spawnSync } from 'child_process';
import connectDB from '../mongoose';
import { fileOrPathExists } from '../utils/utilityfunctions';
function sleep(ms) {
  console.log('sleeping');
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getJobParameters(parameters: DeletJobsDoc) {
  return [String(parameters.gene_db)];
}

export default async (job: SandboxedJob) => {
  //executed for each job
  console.log(
    'Delet Worker ' +
      ' processing job ' +
      JSON.stringify(job.data.jobId) +
      ' Job name: ' +
      JSON.stringify(job.data.jobName),
  );

  await connectDB();
  await sleep(2000);

  //fetch job parameters from database
  const jobParams = await DeletJobsModel.findById(job.data.jobId).exec();

  //assemble job parameters
  const pathToInputFile = `${jobParams.inputFile}`;
  const pathToOutputDir = `/pv/analysis/${job.data.jobUID}/deleteriousness/output`;
  const jobParameters = getJobParameters(jobParams);
  jobParameters.unshift(pathToInputFile, pathToOutputDir);
  console.log(jobParameters);

  //make output directory
  fs.mkdirSync(pathToOutputDir, { recursive: true });

  // save in mongo database
  await DeletJobsModel.findByIdAndUpdate(
    job.data.jobId,
    {
      status: JobStatus.RUNNING,
    },
    { new: true },
  );

  //spawn process
  const jobSpawn = spawnSync(
    './pipeline_scripts/deleteriousness_script.sh',
    jobParameters,
    // { detached: true },
  );

  // console.log('Spawn command log');
  // console.log(jobSpawn?.stdout?.toString());
  console.log('=====================================');
  // console.log('Spawn error log');
  const error_msg = jobSpawn?.stderr?.toString();
  // console.log(error_msg);

  const delet = await fileOrPathExists(
    `${pathToOutputDir}/deleteriousness_output.hg19_multianno_full.tsv`,
  );

  if (delet) {
    console.log(`${job?.data?.jobName} spawn done!`);
    return true;
  } else {
    throw new Error(error_msg || 'Job failed to successfully complete');
  }

  return true;
};
