import bcrypt from 'bcrypt-nodejs';
import { db } from '../server.js';
import Clarifai from 'clarifai';
import dotenv from 'dotenv';

dotenv.config();
const { API_KEY } = process.env;
const app = new Clarifai.App({ apiKey: API_KEY });

const findAll = async (_, res, next) => {
  try {
    const users = await db.select('*').from('users');
    res.send(users);
  } catch (err) {
    next(err);
  }
};

const findOne = async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await db.select('*').from('users').where({ id });
    if (user.length) {
      res.send(user[0]);
    } else {
      res.status(400).send({ error: 'User was not found' });
    }
  } catch (err) {
    next(err);
  }
};

const validateUser = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send({ error: 'Incorret form submission' });
  }
  try {
    const loginData = await db
      .select('email', 'hash')
      .from('login')
      .where('email', '=', email);
    const isValidPassword = bcrypt.compareSync(password, loginData[0].hash);
    const user = await db.select('*').from('users').where('email', '=', email);
    if (isValidPassword) {
      res.send(user[0]);
    } else {
      res.status(400).send({ error: 'Email or password are incorret' });
    }
  } catch (error) {
    next(error);
  }
};

const registerUser = async (req, res, next) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).send({ error: 'Incorret form submission' });
  }
  const hash = bcrypt.hashSync(password);
  const newUser = { email: email, name: name, joined: new Date() };

  await db.transaction(async (trx) => {
    try {
      await trx.insert({ hash, email }).into('login');
      const user = await trx('users').returning('*').insert(newUser);
      res.send(user[0]);
      trx.commit;
    } catch (error) {
      trx.rollback;
      res.status(400).send('Unable to register');
    }
  });
};

const addEntries = async (req, res, next) => {
  const { id } = req.body;
  try {
    const user = await db
      .select('*')
      .from('users')
      .where({ id })
      .increment('entries', 1)
      .returning('*');
    if (user.length) {
      res.send(user[0]);
    } else {
      res.status(400).send({ error: 'User was not found' });
    }
  } catch (error) {
    next(error);
  }
};
const handleAPICall = async (req, res, next) => {
  const { input } = req.body;
  try {
    const apiResponse = await app.models.predict(
      Clarifai.FACE_DETECT_MODEL,
      input
    );
    res.send(apiResponse);
  } catch (error) {
    next(error);
  }
};

const errorHandler = (err, req, res, next) => {
  res.status(500).send({ err: err.message });
};

export default {
  findAll,
  findOne,
  validateUser,
  registerUser,
  addEntries,
  errorHandler,
  handleAPICall,
};
