import fastify from 'fastify';
import view from '@fastify/view';
import pug from 'pug';

const state = {
  users: [
    {
      id: 1,
      name: 'user',
    },
  ],
  courses: [
    {
      id: 1,
      title: 'JS: Массивы',
      description: 'Курс про массивы в JavaScript',
    },
    {
      id: 2,
      title: 'JS: Функции',
      description: 'Курс про функции в JavaScript',
    },
  ],
};

export default async () => {
  const app = fastify();

  await app.register(view, { engine: { pug } });
  
  // exercise 3
  app.get('/', (req, res) => {
    // res.send('Welcome to Hexlet!');
    // exercise 7
    res.view('src/views/index');
  });

  // exercise 4
  app.get('/users', (req, res) => {
    res.send('GET /users');
  });

  app.post('/users', (req, res) => {
    res.send('POST /users');
  });

  // exercise 5
  app.get('/hello', (req, res) => {
    const { name = 'World' } = req.query;
    res.send(`Hello, ${name}!`);
  });

  // exercise 6
  app.get('/courses/new', (req, res) => {
    res.send('Course build');
  });
  
  // see below
  /* app.get('/courses/:id', (req, res) => {
    res.send(`Course ID: ${req.params.id}`);
  }); */

  app.get('/courses/:courseId/lessons/:id', (req, res) => {
    res.send(`Course ID: ${req.params.courseId}; Lesson ID: ${req.params.id}`);
  });

  app.get('/users/:id', (req, res) => {
    const { id } = req.params;
    const user = state.users.find((user) => user.id === parseInt(id));
    if (!user) {
      res.code(404).send({ message: 'User not found' });
    } else {
      res.send(user);
    }
  });

  // exercise 7
  app.get('/courses', (req, res) => {
    const data = {
      courses: state.courses, // Где-то хранится список курсов
      header: 'Курсы по программированию',
    };
    res.view('src/views/courses/index', data);
  });

  app.get('/courses/:id', (req, res) => {
    const { id } = req.params
    const course = state.courses.find(({ id: courseId }) => courseId === parseInt(id));
    if (!course) {
      res.code(404).send({ message: 'Course not found' });
      return;
    }
    const data = {
      course,
    };
    res.view('src/views/courses/show', data);
  });

  return app;
}
