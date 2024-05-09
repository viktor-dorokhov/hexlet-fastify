import fastify from 'fastify';

export default () => {
  const app = fastify();
  
  // exersice 2
  app.get('/', (req, res) => {
    res.send('Welcome to Hexlet!');
  });

  // exersice 3
  app.get('/users', (req, res) => {
    res.send('GET /users');
  });

  app.post('/users', (req, res) => {
    res.send('POST /users');
  });

  // exersice 4
  app.get('/hello', (req, res) => {
    const { name = 'World' } = req.query;
    res.send(`Hello, ${name}!`);
  });

  return app;
}
