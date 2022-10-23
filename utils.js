/**
 * @desc Returns a promise with delay
 * @param { number } ms - Delay time in miliseconds.
 * @returns { Promise } A promise with delay.
 */
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

exports.delay = delay;
