import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import * as multer from 'multer';
import * as fs from 'fs';
import * as fsmove from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import { FileInterceptor } from '@nestjs/platform-express';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import {
  deleteFileorFolder,
  fileOrPathExists,
} from '../utils/utilityfunctions';
// import { GetUser } from '../decorators/get-user.decorator';
// import { JobStatus } from './models/jobs.models';
import validateFile from '../utils/validateFile';

const storageOpts = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync('/tmp/summaryStats')) {
      fs.mkdirSync('/tmp/summaryStats', { recursive: true });
    }
    cb(null, '/tmp/summaryStats'); //destination
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '__' + file.originalname);
  },
});

// @UseGuards(AuthGuard())
@Controller('api/annot/jobs')
export class JobsController {
  // @Inject(AbortJobPublisher) abortJobPublisher: AbortJobPublisher;
  constructor(private readonly jobsService: JobsService) {}

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file', { storage: storageOpts }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    //if gzipped, extract file
    // if (!file) {
    //   throw new BadRequestException('Please upload a file');
    // }
    //
    // if (file.mimetype !== 'text/plain') {
    //   throw new BadRequestException('Please upload a text file');
    // }
    //
    // //validate that file is correct
    // console.log(file);
    // const result = validateFile(file.path);
    // // console.log(result);
    // //create jobUID
    // const jobUID = uuidv4();
    //
    // //create folder with job uid and create input folder in job uid folder
    // const value = await fileOrPathExists(`/pv/analysis/${jobUID}`);
    //
    // if (!value) {
    //   fs.mkdirSync(`/pv/analysis/${jobUID}/input`, { recursive: true });
    // } else {
    //   throw new InternalServerErrorException();
    // }
    //
    // // move uploaded file to that folder
    // fsmove.move(
    //   file.path,
    //   `/pv/analysis/${jobUID}/input/${file.filename}`,
    //   function (err) {
    //     if (err) {
    //       console.error(err);
    //       deleteFileorFolder(file.path).then(() => {
    //         console.log('deleted');
    //       });
    //       throw new InternalServerErrorException();
    //     }
    //   },
    // );
    // //
    // const filename = `/pv/analysis/${jobUID}/input/${file.filename}`;
    //
    // // const imputation_file = `/pv/analysis/${jobUID}/input/imputation.txt`;
    // // writeImputationFile(
    // //   filename,
    // //   imputation_file,
    // //   result.delimiter,
    // //   result.objectColumns,
    // // );
    // //To avoid dangling folders and file in storage, save this return value in local storage
    // //on the user browser and when the submission to db succeeds, delete from local storage
    // //write the specific files in the specific handlers in the worker service
    // return {
    //   jobUID,
    //   filename,
    // };
  }

  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: storageOpts }))
  async create(
    // @Body('marker_name', ParseIntPipe) marker_name,
    @Body() createJobDto: CreateJobDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Please upload a file');
    }

    if (file.mimetype !== 'text/plain') {
      throw new BadRequestException('Please upload a text file');
    }

    const numberColumns = [
      'marker_name',
      'chromosome',
      'position',
      'pvalue',
      'effect_allele',
      'alternate_allele',
      'beta',
      'or',
      'se',
    ];

    const columns = numberColumns.map((column) => {
      return createJobDto[column];
    });

    const wrongColumn = columns.some((value) => value < 1 || value > 10);

    if (wrongColumn) {
      throw new BadRequestException('Column numbers must be between 0 and 10');
    }

    const duplicates = new Set(columns).size !== columns.length;

    if (duplicates) {
      throw new BadRequestException('Column numbers must not have duplicates');
    }

    console.log(createJobDto);

    //validate that file is correct
    console.log(file);

    // const result = validateFile(file.path);

    //create jobUID
    const jobUID = uuidv4();

    //create folder with job uid and create input folder in job uid folder
    const value = await fileOrPathExists(`/pv/analysis/${jobUID}`);

    if (!value) {
      fs.mkdirSync(`/pv/analysis/${jobUID}/input`, { recursive: true });
    } else {
      throw new InternalServerErrorException();
    }

    //write the exact columns needed by the analysis

    // move uploaded file to that folder
    fsmove.move(
      file.path,
      `/pv/analysis/${jobUID}/input/${file.filename}`,
      function (err) {
        if (err) {
          console.error(err);
          deleteFileorFolder(file.path).then(() => {
            console.log('deleted');
          });
          throw new InternalServerErrorException();
        }
      },
    );

    const filename = `/pv/analysis/${jobUID}/input/${file.filename}`;

    // const imputation_file = `/pv/analysis/${jobUID}/input/imputation.txt`;
    // writeImputationFile(
    //   filename,
    //   imputation_file,
    //   result.delimiter,
    //   result.objectColumns,
    // );

    //call service
    //this.jobsService.create(createJobDto);

    // return {
    //   jobUID,
    //   filename,
    // };

    return {
      success: true,
    };
  }

  // @Get()
  // findAll(@Res() response) {
  //   response.status(200).json(response.advancedResults);
  // }
  //
  // @Get('test')
  // test(@Param('id') id: string) {
  //   return {
  //     success: true,
  //   };
  // }
  //
  // @Get(':id')
  // async findOne(@Param('id') id: string) {
  //   const job = await this.jobsService.getJobForUser(id);
  //
  //   if (!job) {
  //     throw new NotFoundException();
  //   }
  //
  //   return job;
  // }
  //
  // @Patch(':id')
  // async update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
  //   //check if job is existing
  //   //  check if job is existing
  //   const job = await this.getJob(id);
  //   const uid = job.jobUID;
  //
  //   //  check if job is running
  //   //if running, return to client to abort job first
  //   if (job.status === JobStatus.RUNNING) {
  //     throw new BadRequestException('Please first abort job');
  //   }
  //
  //   //if there is a new file, move to the job uid input folder
  //
  //   //store job parameters, folder path, filename in database
  //
  //   //send job event
  //   return this.jobsService.update(+id, updateJobDto);
  // }
  //
  // @Post(':id/abort')
  // async abortJob(@Param('id') id: string) {
  //   //  check if job is existing
  //   const job = await this.getJob(id);
  //   //  check if job is running
  //   if (job.status === JobStatus.COMPLETED) {
  //     throw new BadRequestException('Job is completed');
  //   }
  //   //  send abort event to
  //   console.log('Abort job event sent');
  //   await this.abortJobPublisher.publish({
  //     jobId: id,
  //   });
  //
  //   //  return to client
  //   return { success: true };
  // }
  //
  // @Delete(':id')
  // async remove(@Param('id') id: string) {
  //   //  check if job is existing
  //   const job = await this.getJob(id);
  //   const uid = job.jobUID;
  //
  //   //  check if job is running
  //   if (job.status === JobStatus.RUNNING) {
  //     throw new BadRequestException('Please first abort job');
  //   }
  //
  //   try {
  //     // if job is not running, delete in database
  //     await job.remove();
  //
  //     //delete all files in jobUID folder
  //     await deleteFileorFolder(`/pv/analysis/${uid}`);
  //   } catch (e) {
  //     throw new InternalServerErrorException('Please try again');
  //   }
  //
  //   return { success: true };
  // }
  //
  // async getJob(id: string) {
  //   const job = await this.jobsService.findOne(id);
  //
  //   if (!job) {
  //     throw new NotFoundException();
  //   }
  //
  //   return job;
  // }
}
