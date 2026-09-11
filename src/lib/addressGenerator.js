import crypto from "node:crypto";
import "dotenv/config";
import { FIRST_NAMES, LAST_NAMES } from "./components/rand_name.js";

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


let sequence = crypto.randomInt(0, 36 ** 2);


function uniqueSuffix() {
  const time = Math.floor(Date.now() / 1000).toString(36);
  sequence = (sequence + 1) % (36 ** 2);
  const seq = sequence.toString(36).padStart(2, "0");
  const rand = crypto.randomInt(36 ** 3).toString(36).padStart(3, "0");

  return `${time}${seq}${rand}`;
}

export function generateLocalPart() {
  const first = pick(FIRST_NAMES).toLowerCase();
  const last = pick(LAST_NAMES).toLowerCase();

  const pattern = pick(PATTERNS);

  const base = pattern({ first, last })
    .slice(0, 12)
    .replace(/[._]+$/, "");

  return `${base}${uniqueSuffix()}`;
}

export function generateAddress(domain = process.env.DOMAIN_ADDRESS) {
  const localPart = generateLocalPart();

  return {
    localPart,
    address: `${localPart}@${domain}`,
  };
}

// you can test the generation of Address
// console.log(generateAddress())