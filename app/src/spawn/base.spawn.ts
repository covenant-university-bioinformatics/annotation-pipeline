import { ChildProcessWithoutNullStreams } from 'child_process';
import { Model } from 'mongoose';
import { AnnotationJobDocument } from '../jobs/models/annotation.jobs.models';

interface BaseDTO {
  jobId: string;
  jobName: string;
  jobUID: string;
  filename: string;
}

export abstract class BaseSpawn<T extends BaseDTO> {
  spawnName: string;
  pathToInputFile?: string;
  pathToOutputDir: string;
  jobId: string;
  jobName: string;
  jobUID: string;
  jobSpawn: ChildProcessWithoutNullStreams;
  errorMessage: string = '';

  constructor(spawnName: string, newJobDto: T) {
    this.jobId = newJobDto.jobId;
    this.jobName = newJobDto.jobName;
    this.jobUID = newJobDto.jobUID;

    this.spawnName = spawnName;

    this.pathToInputFile = `${newJobDto.filename}`;
    this.pathToOutputDir = `/pv/analysis/${newJobDto.jobUID}/${this.spawnName}/output`;
    this.jobId = newJobDto.jobId;
    this.jobName = newJobDto.jobName;

    const jobParameters = this.getJobParameters(newJobDto);
    jobParameters.unshift(this.pathToInputFile, this.pathToOutputDir);

    // jobParameters.splice(0, 0, this.pathToOutputDir);
    // jobParameters.splice(0, 0, this.pathToInputFile);

    this.spawnProcess(jobParameters);
  }

  abstract getJobParameters(jobDto: T): string[];

  spawnProcess(jobParameters: string[]) {
    const start = Date.now();

    console.log('Spawn Job parameters: ', jobParameters);

    this.spawnAnalysisProcess(jobParameters);

    this.jobSpawn.stdout.on('data', (data) => {
      console.log(`stdout ${this.jobName}: ${data}`);
    });

    this.jobSpawn.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
      this.addErrorMessage(data);
    });

    this.jobSpawn.on('error', (error) => {
      console.log(`error: ${error.message}`);
    });

    this.jobSpawn.on('close', async (code) => {
      console.log(
        `${this.jobName}, time: ${
          Date.now() - start
        } ,child process exited with code ${code}`,
      );
      if (code === 0) {
        console.log('Job completed successfully');
      } else if (code === null) {
        console.log('Job aborted successfully: ', this.errorMessage);
      } else {
        console.log('In close: ', this.errorMessage);
      }
    });
  }

  abstract spawnAnalysisProcess(jobParameters: string[]);

  addErrorMessage(e: string) {
    if (e) {
      this.errorMessage = `${this.errorMessage} + ${e}\n`;
    }
  }
}
