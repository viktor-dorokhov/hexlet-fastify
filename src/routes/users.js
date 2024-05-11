import _ from 'lodash';
import * as yup from 'yup';
import encrypt from '../encrypt.js';

export default (app, db) => {

  app.get('/users', { name: 'users' }, (req, res) => {
    const { term } = req.query;
    const wherePart = term ? 'WHERE name LIKE ?' : '';
    const params = term ? [`%${term}%`] : [];
    db.all(`SELECT * FROM users ${wherePart}`, params, (error, users) => {
      if (error) {
        res.status(500).send(new Error(error));
        return;
      }
      const data = {
        users: users || [],
        form: req.query,
      };
  
      res.view('users/index', data, error);
    });
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
      name: req.body.name.trim(),
      email: req.body.email.trim().toLowerCase(),
      password: encrypt(req.body.password),
    };

    const stmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    stmt.run([user.name, user.email, user.password], function (error) {
      if (error) {
        res.status(500).send(new Error(error));
        return;
      }
      // res.redirect(`/users/${this.lastID}`);
      res.redirect(app.reverse('users'));
    });
  });

  app.get('/users/new', { name: 'userNew' }, (req, res) => {
    res.view('users/new', { form: {} });
  });

  app.get('/users/:id', { name: 'userOne' }, (req, res) => {
    const { id } = req.params;
    db.get(`SELECT * FROM users WHERE id = ?`, [id], (error, user) => {
      console.log('BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB'); 
      if (error) {
        res.status(500).send(new Error(error));
        return;
      }
      if (!user) {
        res.code(404).send({ message: 'User not found' });
      } else {
        res.view('users/show', { user });
      }
    });
  });

  // for Override methods need to use Promise
  app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    return new Promise((resolve, reject) => {
      stmt.run(id, (err) => {
        if (err) {
          req.flash('warning', 'Ошибка удаления пользователя');
          res.redirect(app.reverse('user', { id }));
          reject();
        }
        req.flash('success', 'Пользователь успешно удален');
        res.redirect(app.reverse('users'));
        resolve(true);
      });
    });
  });
};