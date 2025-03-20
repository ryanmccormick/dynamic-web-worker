(function (global) {
  'use strict';

  /**
   * Adapter class that creates, manages and handles data transfer between
   * a script running on a page and a web worker script.
   */
  class WorkerBridge {
    workerFn;
    workerCtx;

    constructor(workerFn) {
      this.workerFn = workerFn;
      this.workerCtx = this.initWorker();
    }

    async doWork(data) {
      this.workerCtx.postMessage(data);

      return new Promise((resolve, reject) => {
        let timeoutRef = -1;

        function cleanup() {
          if (timeoutRef > -1) {
            clearTimeout(timeoutRef);
          }
        }

        function handleEvent(event) {
          cleanup();
          return resolve(event.data);
        }

        function handleAsyncTimeout() {
          cleanup();
          return reject('[WorkerBridge]: async timeout has been exceeded.');
        }

        this.workerCtx.addEventListener('message', handleEvent);

        timeoutRef = setTimeout(handleAsyncTimeout, 10000);
      });
    }

    initWorker() {
      const workerBody = new Blob([`(${this.workerFn})(self)`], { type: 'application/javascript' });
      return new Worker(URL.createObjectURL(workerBody));
    }

    dispose() {
      if (this.workerCtx && this.workerCtx.onmessage) {
        this.workerCtx.terminate();
      }
    }
  }

  // Add worker bridge to window/global context.
  function init() {
    global.WorkerBridge = global.WorkerBridge ?? WorkerBridge;
  }

  init();
  /////////
})(window);
