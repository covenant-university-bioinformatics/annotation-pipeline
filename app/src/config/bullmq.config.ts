export default {
  concurrency: parseInt(process.env.QUEUE_CONCURRENCY || "1"),
  queueName: process.env.QUEUE_NAME || "bullmqtests",
  connection: {
    host: process.env.REDIS_BULL_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
  },
  limiter: {
    max: parseInt(process.env.MAX_LIMIT || "1"),
    duration: parseInt(process.env.DURATION_LIMIT || "10000"),
  },
  numWorkers: process.env.NUMWORKERS || 5,
};
