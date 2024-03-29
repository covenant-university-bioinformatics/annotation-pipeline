import { SandboxedJob } from 'bullmq';
import * as fs from 'fs';
import {
  JobStatus,
  AnnotationJobsModel,
} from '../jobs/models/annotation.jobs.model';
import {
  AnnotationDoc,
  AnnotationModel,
} from '../jobs/models/annotation.model';
import { spawnSync } from 'child_process';
import connectDB, { closeDB } from '../mongoose';
import {
  deleteFileorFolder,
  fileOrPathExists,
  writeAnnotationFile,
} from '@cubrepgwas/pgwascommon';
import * as extract from "extract-zip";
// import { globby } from "globby";
import * as globby from "globby";
// const { globby } = require('globby')
// const globby = require('globby');


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

  //--1
  let fileInput = jobParams.inputFile;

  //check if file is a zipped file
  if(/[^.]+$/.exec(jobParams.inputFile)[0] === 'zip'){
    fs.mkdirSync(`/pv/analysis/${jobParams.jobUID}/zip`, { recursive: true });
    await extract(jobParams.inputFile, {dir: `/pv/analysis/${jobParams.jobUID}/zip/`});
    const paths = await globby(`/pv/analysis/${jobParams.jobUID}/zip/*.*`);
    if (paths.length === 0){
      throw new Error('Zip had no files')
    }
    if (paths.length > 1){
      throw new Error('Zip had too many files')
    }
    fileInput = paths[0]
  }

  //create input file and folder
  let filename;

  //--2
  //extract file name
  const name = fileInput.split(/(\\|\/)/g).pop();

  if (parameters.useTest === false) {
    filename = `/pv/analysis/${jobParams.jobUID}/input/${name}`;
  } else {
    filename = `/pv/analysis/${jobParams.jobUID}/input/test.txt`;
  }

  //write the exact columns needed by the analysis
  //--3
  writeAnnotationFile(fileInput, filename, {
    marker_name: parameters.marker_name - 1,
    chr: parameters.chromosome - 1,
    effect_allele: parameters.effect_allele - 1,
    alternate_allele: parameters.alternate_allele - 1,
    pos: parameters.position - 1,
  });

  if (parameters.useTest === false) {
    deleteFileorFolder(jobParams.inputFile).then(() => {
      console.log('deleted');
    });
  }
  //--4
  if(/[^.]+$/.exec(jobParams.inputFile)[0] === 'zip'){
    deleteFileorFolder(fileInput).then(() => {
      console.log('deleted');
    });
  }

  //assemble job parameters
  const pathToInputFile = filename;
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
      inputFile: filename,
    },
    { new: true },
  );

  //spawn process
  const start = Date.now();
  await sleep(3000);
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

  closeDB();

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
