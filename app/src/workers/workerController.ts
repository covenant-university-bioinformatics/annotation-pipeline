class WorkerController {
  _runningJob = 0;

  get runningJob() {
    return this._runningJob;
  }

  incrementRunningJob() {
    this._runningJob = this._runningJob + 1;
    console.log('running job incremented ' + this.runningJob);
  }

  decrementRunningJob() {
    this._runningJob = this._runningJob - 1;
    console.log('running job decremented ' + this.runningJob);
  }
}

const workerController = new WorkerController();

export default workerController;
