import express from 'express';
import controller from '../controllers/usersController.js';

const app = express.Router();

app.get('/', controller.findAll);
app.get('/profile/:id', controller.findOne);
app.post('/signin', controller.validateUser);
app.post('/register', controller.registerUser);
app.patch('/image', controller.addEntries);
app.post('/apiCall', controller.handleAPICall);
app.use(controller.errorHandler);

export { app as userRouter };
