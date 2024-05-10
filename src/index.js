import fastify from 'fastify';
import middie from '@fastify/middie';
import view from '@fastify/view';
import formbody from '@fastify/formbody';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import flash from '@fastify/flash';
import { plugin as fastifyReverseRoutes } from 'fastify-reverse-routes';
import sqlite3 from 'sqlite3';
import morgan from 'morgan';
import pug from 'pug';
import sanitize from 'sanitize-html';
import _ from 'lodash';
import encrypt from './encrypt.js';

import addRoutes from './routes/index.js';

const logger = morgan('combined');

const db = new sqlite3.Database(':memory:');

const state = {
  users: [
    {
      id: _.uniqueId(),
      name: 'user',
      email: 'user@gmail.com',
      password: encrypt('123'),
    },
  ],
  courses: [
    {
      id: _.uniqueId(),
      title: 'JS: Массивы',
      description: 'Курс про массивы в JavaScript',
    },
    {
      id: _.uniqueId(),
      title: 'JS: Функции',
      description: 'Курс про функции в JavaScript',
    },
  ],
};

export default async () => {
  const app = fastify({ exposeHeadRoutes: false });

  await app.register(middie);
  await app.register(fastifyReverseRoutes);
  await app.register(view, {
    engine: { pug },
    root: 'src/views',
    defaultContext: {
      route: (name, placeholdersValues) => app.reverse(name, placeholdersValues),
    },
  });
  await app.register(formbody);
  await app.register(fastifyCookie);
  await app.register(fastifySession, {
    secret: 'a secret with minimum length of 32 characters',
    cookie: { secure: false },
  });
  await app.register(flash);

  app.use(logger);

  app.addHook('preHandler', (req, res, next) => {
    console.log(`Запрос выполнен в ${new Date()}`);
    next();
  });

  addRoutes(app, state);

  // exercise 5
  app.get('/hello', (req, res) => {
    const { name = 'World' } = req.query;
    res.send(`Hello, ${name}`);
  });

  app.get('/courses/:courseId/lessons/:id', (req, res) => {
    res.send(`Course ID: ${req.params.courseId}; Lesson ID: ${req.params.id}`);
  });

  // exercise 8
  app.get('/users/showid/:id', (req, res) => {
    // test
    // http://127.0.0.1:3000/users/showid/%3Cscript%3Ealert('attack!')%3B%3C%2Fscript%3E
    const escapedId = sanitize(req.params.id);
    res.type('html');
    res.send(`<h1>${escapedId}</h1>`);
  });

  // exercise 18
  app.get('/cookies', (req, res) => {
    res.send(req.cookies);
  });

  return app;
}
