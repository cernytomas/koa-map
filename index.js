"use strict";
var co = require('co');

module.exports.mapLimit = function (array, numberOfProcesses, generator) {
  return new Promise(
    function runIt(resolveFirst, rejectFirst) {
      var i = 0, l = array.length, results = [], runningProcesses = 0;
      if (numberOfProcesses < 1) {
        return rejectFirst(new Error('Number of processes has to be positive number'));
      }
      if (l === 0 || !Array.isArray(array)) {
        return resolveFirst(array);
      }

      var process = new Promise(
        /** recursive function inside Promise */
        function runProcess(resolve, reject) {
          if (i < l) {
            /** asynchronous iteration over maximum empty workers */
            let r = range(i, i + numberOfProcesses - runningProcesses, l);
            r.forEach((iterator) => {
              runningProcesses++;
              /** increment array index iterator */
              i++;
              /** run generator */
              co(generator(array[iterator], iterator, array))
                .then((res) => {
                  /** save generator's result to results array under it's original index */
                  results[iterator] = res;
                  /** decrement number of running processes */
                  runningProcesses--;
                  /** if there is no more running process and it has already iterated array length
                   *  then resolve it
                   *  or recurse */
                  if (runningProcesses === 0 && i === l) {
                    resolve(results)
                  } else {
                    runProcess(resolve, reject)
                  }
                })
                .catch((rej) => {
                  results[i] = {error: rej};
                  runningProcesses--;
                  if (runningProcesses === 0 && i === l) {
                    resolve(results)
                  } else {
                    runProcess(resolve, reject)
                  }
                })
            })
          }
        }
      );

      process.then((res) => {
        return resolveFirst(res)
      });
    }
  )
};

/**
 *
 * @param array
 * @param delay Delay in miliseconds
 * @param generator
 * @returns {Promise}
 */
module.exports.mapDelay = function (array, delay, generator) {
  return new Promise(
    function runIt(resolveFirst, rejectFirst) {
      var i = 0, l = array.length, results = [];
      if (delay < 0) {
        return rejectFirst(new Error('Number of processes has to be positive number'));
      }
      if (l === 0 || !Array.isArray(array)) {
        return resolveFirst(array);
      }

      var process = new Promise(
        /** recursive function inside Promise */
        function runProcess(resolve, reject) {
          if (i < l) {
            /** run generator */
            co(generator(array[i], i, array))
              .then((res) => {
                /** save generator's result to results array under it's original index */
                results[i] = res;
                i++;
                /** if there is no more running process and it has already iterated array length
                 *  then resolve it
                 *  or recurse */
                if (i === l) {
                  resolve(results)
                } else {
                  setTimeout(function () {
                    runProcess(resolve, reject)
                  }, delay)
                }
              })
              .catch((rej) => {
                results[i] = {error: rej};
                i++;
                if (i === l) {
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

      process.then((res) => {
        return resolveFirst(res)
      });
    }
  )
};

function range (min, max, arrayLength) {
  let arr = [];
  max = max <= arrayLength ? max : arrayLength;
  for (min; min < max; min++) {
    arr.push(min);
  }
  return arr;
}