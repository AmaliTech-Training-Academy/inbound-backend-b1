import crypto from "node:crypto";
import { env } from "../configs/env.js";
import { FIRST_NAMES, LAST_NAMES } from "./names.js";

function pick(arr) {
  return arr[crypto.randomInt(arr.length)];
}

function randomDigits(min = 2, max = 6) {
  const length = crypto.randomInt(min, max + 1);

  const low = 10 ** (length - 1);
  const high = 10 ** length;

  return String(crypto.randomInt(low, high));
}

function randomLetters(min = 1, max = 3) {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const length = crypto.randomInt(min, max + 1);

  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars[crypto.randomInt(chars.length)];
  }

  return result;
}

const PATTERNS = [

  ({ first, last }) =>
    `${first}${last}${randomDigits(2, 6)}`,


  ({ first, last }) =>
    `${first}.${last}${randomDigits(2, 6)}`,

  
  ({ first }) =>
    `${first}${randomDigits(3, 7)}`,

 
  ({ first }) =>
    `${first}${randomLetters(1, 2)}${randomDigits(2, 6)}`,


  ({ first, last }) =>
    `${first[0]}${last}${randomDigits(2, 6)}`,


  ({ first, last }) =>
    `${first}.${last[0]}${randomDigits(2, 6)}`,


  ({ first, last }) =>
    `${first}${last}.${randomLetters(1, 2)}${randomDigits(2, 6)}`,


  ({ first, last }) =>
    `${randomLetters(1, 2)}${first}${last}${randomDigits(2, 6)}`,


  ({ first, last }) =>
    `${randomDigits(2, 5)}${first}${last}`,


  ({ first }) =>
    `${first}_${randomLetters(1, 2)}${randomDigits(2, 6)}`,
];

export function generateLocalPart() {
  const first = pick(FIRST_NAMES).toLowerCase();
  const last = pick(LAST_NAMES).toLowerCase();

  const pattern = pick(PATTERNS);

  return pattern({ first, last });
}

export function generateAddress() {
  const localPart = generateLocalPart();

  return {
    localPart,
    address: `${localPart}@${env.DOMAIN_ADDRESS}`,
  };
}