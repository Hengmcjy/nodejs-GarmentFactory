
// ## share general function

const mongoose = require('mongoose');
const moment = require('moment-timezone');



//////////////////////////////////////////////////////////////////////////////////////////////
//////////////  ##-share function general    /////////////////////////////////////////////////////////

exports.asyncForEach= async (array, callback) => {
// async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

exports.asyncForEach2= async (array, callback) => {
// async function asyncForEach2(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

exports.asyncForEach3= async (array, callback) => {
  // async function asyncForEach2(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

exports.asyncForEach4= async (array, callback) => {
  // async function asyncForEach2(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

exports.setStrLen= async (len, num) => {
// async function setStrLen(len, num) {
  while ((num+'').length < len ){num = '0'+num;}
  return num+'';
}

exports.setBackStrLen= async (len, num) => {
  // async function setStrLen(len, num) {
    while ((num+'').length < len ){num = num + '0';}
    return num+'';
}

//////////////  ##-share function general    /////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////









