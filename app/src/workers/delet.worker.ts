import { SandboxedJob } from 'bullmq';
import * as fs from 'fs';
import {
  DeletJobsDoc,
  JobStatus,
  DeletJobsModel,
} from '../jobs/models/delet.jobs.model';
import { spawnSync } from 'child_process';
import connectDB, { closeDB } from '../mongoose';
import {
  deleteFileorFolder,
  fileOrPathExists,
  writeAnnotationFile,
} from '@cubrepgwas/pgwascommon';
import { AnnotationModel } from '../jobs/models/annotation.model';
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

  //create input file and folder
  let filename;

  //extract file name
  const name = jobParams.inputFile.split(/(\\|\/)/g).pop();

  if (jobParams.useTest === false) {
    filename = `/pv/analysis/${jobParams.jobUID}/input/${name}`;
  } else {
    filename = `/pv/analysis/${jobParams.jobUID}/input/test.txt`;
  }

  writeAnnotationFile(jobParams.inputFile, filename, {
    marker_name: jobParams.marker_name - 1,
    chr: jobParams.chromosome - 1,
    effect_allele: jobParams.effect_allele - 1,
    alternate_allele: jobParams.alternate_allele - 1,
    pos: jobParams.position - 1,
  });

  if (jobParams.useTest === false) {
    deleteFileorFolder(jobParams.inputFile).then(() => {
      console.log('deleted');
    });
  }

  //assemble job parameters
  const pathToInputFile = filename;
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
      inputFile: filename,
    },
    { new: true },
  );

  await sleep(3000);
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

  closeDB();

  if (delet) {
    console.log(`${job?.data?.jobName} spawn done!`);
    return true;
  } else {
    throw new Error(error_msg || 'Job failed to successfully complete');
  }

  return true;
};
