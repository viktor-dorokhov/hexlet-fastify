import _ from 'lodash';
import * as yup from 'yup';
import { matchValue } from '../utils.js';

export default (app, state) => {
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
    res.view('users/index', data);
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
  
      res.view('users/new', data);
      return;
    }

    const user = {
      id: _.uniqueId(),
      name: req.body.name.trim(),
      email: req.body.email.trim().toLowerCase(),
      password: encrypt(req.body.password),
    };
  
    state.users.push(user);
    
    // res.redirect('/users');
    res.redirect(app.reverse('users'));
  });

  app.get('/users/new', { name: 'userNew' }, (req, res) => {
    res.view('users/new', { form: {} });
  });

  app.get('/users/:id', { name: 'userShow' }, (req, res) => {
    const { id } = req.params;
    const user = state.users.find((user) => user.id === id);
    if (!user) {
      res.code(404).send({ message: 'User not found' });
    } else {
      // res.send(user);
      res.view('users/show', { user });
    }
  });
};