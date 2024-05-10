import fastify from 'fastify';
import middie from '@fastify/middie';
import view from '@fastify/view';
import formbody from '@fastify/formbody';
import { plugin as fastifyReverseRoutes } from 'fastify-reverse-routes';
import morgan from 'morgan';
import pug from 'pug';
import sanitize from 'sanitize-html';
import _ from 'lodash';
import * as yup from 'yup';

const logger = morgan('combined');

const state = {
  users: [
    {
      id: _.uniqueId(),
      name: 'user',
      email: 'user@gmail.com',
      password: '123',
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


const matchValue = (text, value) => text.trim().toLowerCase().includes(value.trim().toLowerCase());

export default async () => {
  const app = fastify({ exposeHeadRoutes: false });

  await app.register(middie);
  await app.register(fastifyReverseRoutes);
  await app.register(view, {
    engine: { pug },
    defaultContext: {
      route: (name, placeholdersValues) => app.reverse(name, placeholdersValues),
    },
  });
  await app.register(formbody);

  app.use(logger);
  
  // exercise 3
  app.get('/', { name: 'root' }, (req, res) => {
    // res.send('Welcome to Hexlet!');
    // exercise 7
    res.view('src/views/index');
  });

  // exercise 4
  app.get('/users', { name: 'users' }, (req, res) => {
    // res.send('GET /users');
    let filteredUsers = state.users;
    const { term } = req.query;
    if (term) {
      filteredUsers = filteredUsers.filter(({ name }) => matchValue(name, term));
    }
    const data = {
      users: filteredUsers,
      form: req.query,
    };
    res.view('src/views/users/index', data);
  });

  app.post('/users', {
    attachValidation: true,
    schema: {
      body: yup.object({
        name: yup.string().min(2),
        email: yup.string().email(),
        password: yup.string().min(5),
        confirmPassword: yup.string().min(5),
      }),
    },
    validatorCompiler: ({ schema, method, url, httpPart }) => (data) => {
      if (data.password !== data.confirmPassword) {
        return {
          form: data,
          error: new yup.ValidationError('Password confirmation is not equal the password'),
        };
      }
      try {
        const result = schema.validateSync(data);
        return { value: result };
      } catch (e) {
        return { form: data, error: e };
      }
    },
  }, (req, res) => {
    // res.send('POST /users');
    if (req.validationError) {
      const data = {
        form: req.body,
        error: req.validationError,
      };
  
      res.view('src/views/users/new', data);
      return;
    }

    const user = {
      id: _.uniqueId(),
      name: req.body.name.trim(),
      email: req.body.email.trim().toLowerCase(),
      password: req.body.password,
    };
  
    state.users.push(user);
    
    // res.redirect('/users');
    res.redirect(app.reverse('users'));
  });

  // exercise 5
  app.get('/hello', (req, res) => {
    const { name = 'World' } = req.query;
    res.send(`Hello, ${name}!`);
  });

  // exercise 6
  app.get('/courses/new', { name: 'courseNew' }, (req, res) => {
    // res.send('Course build');
    res.view('src/views/courses/new', { form: {} });
  });
  
  // see below
  /* app.get('/courses/:id', (req, res) => {
    res.send(`Course ID: ${req.params.id}`);
  }); */

  app.get('/courses/:courseId/lessons/:id', (req, res) => {
    res.send(`Course ID: ${req.params.courseId}; Lesson ID: ${req.params.id}`);
  });

  app.get('/users/new', { name: 'userNew' }, (req, res) => {
    res.view('src/views/users/new', { form: {} });
  });

  app.get('/users/:id', { name: 'userShow' }, (req, res) => {
    const { id } = req.params;
    const user = state.users.find((user) => user.id === id);
    if (!user) {
      res.code(404).send({ message: 'User not found' });
    } else {
      // res.send(user);
      res.view('src/views/users/show', { user });
    }
  });

  // exercise 7
  app.get('/courses', { name: 'courses' }, (req, res) => {
    let filteredCourses = state.courses;
    const { title: filterTitle, desc: filterDesc } = req.query;
    if (filterTitle) {
      filteredCourses = filteredCourses.filter(({ title }) => matchValue(title, filterTitle));
    }
    if (filterDesc) {
      filteredCourses = filteredCourses.filter(({ description }) => matchValue(description, filterDesc));
    }
    const data = {
      courses: filteredCourses, // Где-то хранится список курсов
      header: 'Курсы по программированию',
      form: req.query,
    };
    res.view('src/views/courses/index', data);
  });

  app.post('/courses', {
    attachValidation: true,
    schema: {
      body: yup.object({
        title: yup.string().min(2),
        desc: yup.string().min(10),
      }),
    },
    validatorCompiler: ({ schema, method, url, httpPart }) => (data) => {
      try {
        const result = schema.validateSync(data);
        return { value: result };
      } catch (e) {
        return { form: data, error: e };
      }
    },
  }, (req, res) => {
    if (req.validationError) {
      const data = {
        form: req.body,
        error: req.validationError,
      };
  
      res.view('src/views/courses/new', data);
      return;
    }

    const course = {
      id: _.uniqueId(),
      title: req.body.title.trim(),
      description: req.body.desc,
    };
  
    state.courses.push(course);
  
    // res.redirect('/courses');
    res.redirect(app.reverse('courses'));
  });

  app.get('/courses/:id', { name: 'courseShow' }, (req, res) => {
    const { id } = req.params
    const course = state.courses.find(({ id: courseId }) => courseId === id);
    if (!course) {
      res.code(404).send({ message: 'Course not found' });
      return;
    }
    const data = {
      course,
    };
    res.view('src/views/courses/show', data);
  });

  // exercise 8
  app.get('/users/showid/:id', (req, res) => {
    // test
    // http://127.0.0.1:3000/users/showid/%3Cscript%3Ealert('attack!')%3B%3C%2Fscript%3E
    const escapedId = sanitize(req.params.id);
    res.type('html');
    res.send(`<h1>${escapedId}</h1>`);
  });

  return app;
}
