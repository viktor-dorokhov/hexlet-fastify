import fastify from 'fastify';

const state = {
  users: [
    {
      id: 1,
      name: 'user',
    },
  ],
};

export default () => {
  const app = fastify();
  
  // exercise 3
  app.get('/', (req, res) => {
    res.send('Welcome to Hexlet!');
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
  
  app.get('/courses/:id', (req, res) => {
    res.send(`Course ID: ${req.params.id}`);
  });

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

  return app;
}
