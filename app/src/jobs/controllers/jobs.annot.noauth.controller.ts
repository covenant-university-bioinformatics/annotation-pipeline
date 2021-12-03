import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import * as multer from 'multer';
import * as fs from 'fs';
import { FileInterceptor } from '@nestjs/platform-express';
import { JobsAnnotService } from '../services/jobs.annot.service';
import { CreateJobDto } from '../dto/create-job.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../../decorators/get-user.decorator';
import { GetJobsDto } from '../dto/getjobs.dto';
import { getFileOutput } from '@cubrepgwas/pgwascommon';

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

@Controller('api/annot/noauth/jobs')
export class JobsAnnotNoAuthController {
  constructor(private readonly jobsService: JobsAnnotService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: storageOpts }))
  async create(
    @Body(ValidationPipe) createJobDto: CreateJobDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    //call service
    return await this.jobsService.create(createJobDto, file);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const job = await this.jobsService.getJobByIDNoAuth(id);

    job.user = null;
    return job;
  }

  @Get('/output/:id/:file')
  async getOutput(@Param('id') id: string, @Param('file') file_key: string) {
    const job = await this.jobsService.getJobByIDNoAuth(id);
    return getFileOutput(id, file_key, job);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.jobsService.removeJobNoAuth(id);
  }
}
