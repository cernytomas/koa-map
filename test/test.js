"use strict";
var co = require('co');
var helpers = require('./../index');

function * timeout(variable) {
  console.log("start", variable);
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      console.log('done', variable);
      if (variable == 4) {
        return reject('chyba');
      }
      resolve(variable);
    }, Math.random() * 10);
  });

}

co(function * () {
  let res = yield helpers.mapLimit([1, 2, 3, 4, 5, 6, 7], 3, timeout);
  console.log('exit', res);
});

co(function * () {
  let res = yield helpers.mapLimit(['a', 'b', 'c', 'd', 'e', 'f', 'g'], 53, timeout);
  console.log('exit', res);
});

co(function * () {
  let res = yield helpers.mapLimit([], 3, timeout);
  console.log('exit', res);
});

co(function * () {
  let res = yield helpers.mapLimit('karel', 3, timeout);
  console.log('exit', res);
});

co(function * () {
  try {
    let res = yield helpers.mapLimit(undefined, 3, timeout);
    console.log('exit', res);
  } catch (err) {
    console.error(err)
  }
});


co(function * () {
  try {
    let res = yield helpers.mapLimit([], 0, timeout);
    console.log('exit', res);
  } catch (err) {
    console.error(err)
  }
});

co(function * () {
  let res = yield helpers.mapDelay([1,2,3,5,8,10], 1000, timeout);
  console.log('exit', res);
});