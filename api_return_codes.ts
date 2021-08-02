import { isNumber } from "node:util";

const PARTY_NOT_FOUND = 0;
const USER_NOT_FOUND = 1;
const DB_ERROR = 2;
const SUCCESS = 3;
const USER_ALREADY_PRESENT = 4;

export interface apiReturnCodesI {
  PARTY_NOT_FOUND: number;
  USER_NOT_FOUND: number;
  DB_ERROR: number;
  SUCCESS: number;
  USER_ALREADY_PRESENT: number;
}

export const apiReturnCodes: apiReturnCodesI = {
  PARTY_NOT_FOUND,
  USER_NOT_FOUND,
  USER_ALREADY_PRESENT,
  DB_ERROR,
  SUCCESS
}