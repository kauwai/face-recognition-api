import express from 'express';
import cors from 'cors';
import knex from 'knex';
import dotenv from 'dotenv';
import { userRouter } from './routes/userRouter.js';

dotenv.config();
const { USER, PASSWORD, DATABASE, PORT } = process.env;

const db = knex({
  client: 'pg',
  connection: {
    host: 'postgresql-trapezoidal-71980',
    user: USER,
    password: PASSWORD,
    database: DATABASE,
  },
});

const app = express();

app.use(express.json());
app.use(cors());
app.use('/', userRouter);

app.listen(PORT, () => console.log('Server started...'));

export { db };
