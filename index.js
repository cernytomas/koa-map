"use strict";
var co = require('co');

module.exports.mapLimit = function (array, numberOfProcesses, generator) {
  /** If wrong number of processes reject it */
  if (numberOfProcesses < 1) {
    return Promise.reject(new Error('Number of processes has to be positive number'));
  }
  /** If not array or empty array resolve it */
  if (!Array.isArray(array)) {
    return Promise.reject(new Error('No array passed'));
  }
  if (array.length === 0) {
    return Promise.resolve(array);
  }

  var results = [], runningProcesses = 0, keys = array.map((item, key) => {
    return key;
  });

  return new Promise(
    /** recursive function inside Promise */
    function runProcess(resolve, reject) {
      if (keys.length > 0) {
        /** asynchronous iteration over maximum empty workers */
        keys.splice(0, numberOfProcesses - runningProcesses).forEach((key) => {
          runningProcesses++;
          /** run generator */
          co(generator(array[key], key, array))
            .then((res) => {
              /** save generator's result to results array under it's original index */
              results[key] = res;
              /** decrement number of running processes */
              runningProcesses--;
              runProcess(resolve, reject)
            })
            .catch((rej) => {
              results[key] = {error: rej};
              runningProcesses--;
              runProcess(resolve, reject)
            })
        })
      } else if (runningProcesses === 0 && keys.length === 0) {
        /** if there is no more running process and it has already iterated array length
         *  then resolve it */
        resolve(results);
      }
    }
  );
};

/**
 *
 * @param array
 * @param delay Delay in miliseconds
 * @param generator
 * @returns {Promise}
 */
module.exports.mapDelay = function (array, delay, generator) {
  /** If wrong number of processes reject it */
  if (delay < 0) {
    return Promise.reject(new Error('Delay has to be positive number or zero'));
  }
  /** If not array or empty array resolve it */
  if (!Array.isArray(array)) {
    return Promise.reject(new Error('No array passed'));
  }
  if (array.length === 0) {
    return Promise.resolve(array);
  }

  var results = [], keys = array.map((item, key) => {
    return key;
  });
  return new Promise(
    /** recursive function inside Promise */
    function runProcess(resolve, reject) {
      if (keys.length > 0) {
        /** run generator */
        let key = keys.splice(0, 1)[0];
        co(generator(array[key], key, array))
          .then((res) => {
            /** save generator's result to results array under it's original index */
            results[key] = res;
            /** if it has already iterated array length
             *  then resolve it
             *  or recurse */
            if (keys.length === 0) {
              resolve(results)
            } else {
              setTimeout(function () {
                runProcess(resolve, reject)
              }, delay)
            }
          })
          .catch((rej) => {
            results[key] = {error: rej};
            if (keys.length === 0) {
              resolve(results)
            } else {
              setTimeout(function () {
                runProcess(resolve, reject)
              }, delay)
            }
          })
      }
    }
  );
};