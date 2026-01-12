import 'dotenv/config';
import cron from 'node-cron';
import { sendComplimentAndFlowerToAllUsers } from '../controllers';

const cronOptions = {
  scheduled: true,
  timezone: process.env.TIMEZONE,
};

cron.schedule(
  '0 10 * * *',
  () => {
    sendComplimentAndFlowerToAllUsers();
  },
  cronOptions,
);
