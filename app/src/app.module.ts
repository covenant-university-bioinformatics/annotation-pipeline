import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JobsModule } from './jobs/jobs.module';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from './config/mongoose';
import { QueueModule } from './jobqueue/queue.module';

// console.log(config);
@Module({
  imports: [
    MongooseModule.forRoot(
      `mongodb://${config.user}:${config.password}@${config.podName}-0.${config.host}:27017,${config.podName}-1.${config.host}:27017,${config.podName}-2.${config.host}:27017/?authSource=admin&replicaSet=rs0`,
      {
        dbName: config.dbName,
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
      },
    ),
    JobsModule,
    QueueModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
