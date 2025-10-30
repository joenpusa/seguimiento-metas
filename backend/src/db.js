import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import dotenv from 'dotenv';
dotenv.config();

export const openDb = async () => {
  return open({
    filename: process.env.DATABASE_PATH || './data/database.sqlite',
    driver: sqlite3.Database
  });
};
