(function (global, docRef) {
  'use strict';

  let workerRef;
  let nameInputRef;
  let greetingBtnRef;

  function init() {
    // Init a new worker bridge instance that will use
    // the myWorker function to manipulate received input.
    workerRef = new WorkerBridge(myWorker);
    initFormRefs();
  }

  init();
  ///////////

  function handleGetGreetingClick(event) {
    const value = (() => nameInputRef.value)();

    greetingBtnRef.setAttribute('disabled', true);
    return workerRef
      .doWork(value)
      .then((result) => {
        alert(result);
        return result;
      })
      .finally(() => {
        greetingBtnRef.removeAttribute('disabled');
      });
  }

  /**
   * Web worker implementation that will be run and managed by
   * the WorkerBridge instance that is initialized in the init function
   * above and assigned to the workerRef variable. This function is not meant
   * for interaction within this script.
   */
  function myWorker(globalCtx) {
    let workerCalls = 0;

    // Event listener setups
    function initWorker() {
      globalCtx.addEventListener('message', workRequestHandler);
    }

    initWorker();
    ///////////////////

    // Do all of your work in here.
    function workRequestHandler(event) {
      workerCalls += 1;
      const dataReceived = event.data;

      // Received name, create greeting
      const update = `Hello ${dataReceived}, how are you?`;

      // emulate one second latency for hard working task.
      setTimeout(() => {
        sendResult(update);
      }, 1000);
    }

    // Util to send result back to caller.
    function sendResult(payload) {
      globalCtx.postMessage(payload);
    }
  }

  function initFormRefs() {
    greetingBtnRef = docRef.getElementById('getGreetingBtn');
    nameInputRef = docRef.getElementById('nameInput');
    greetingBtnRef.addEventListener('click', handleGetGreetingClick);
  }
})(window, document);
