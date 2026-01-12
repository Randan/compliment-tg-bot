/* eslint-disable import/first */
import type { Express, Request, Response } from 'express';
import express from 'express';
import { appPort, connectDB, lib } from './utils';

const app: Express = express();

app.get('/', (req: Request, res: Response): void => {
  res.status(200).send(lib.webGreetings());
});

// Connect to MongoDB before starting the server
const startApp = async (): Promise<void> => {
  try {
    await connectDB();

    // Import events and cron after DB connection
    await import('./events');
    await import('./cron');

    app.listen(appPort, () => {
      console.log(`⚡⚡⚡ ComplimentBot Alive on PORT: ${appPort}`);
    });
  } catch (err) {
    console.error('Failed to start application:', err);
    process.exit(1);
  }
};

startApp();
