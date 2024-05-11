import encrypt from '../encrypt.js';

export default (app, db) => {
  // exercise 4
  app.get('/session/new', { name: 'sessionNew' }, (req, res) => {
    res.view('session/new', { form: {} });
  });

  app.get('/session', { name: 'session' }, (req, res) => {
    res.redirect(app.reverse('root'));
  });

  app.post('/session', (req, res) => {
    const { nickname, password } = req.body;
    db.get(`SELECT * FROM users WHERE name = ?`, [nickname], (error, user) => {
      if (error) {
        res.status(500).send(new Error(error));
        return;
      }
      if (user && user.password === encrypt(password)) {
        req.session.userId = user.id;
        // res.flash('info', `Welcome, ${user.nickname}!`);
        req.flash('success', 'Пользователь залогинен');
        res.redirect(app.reverse('root'));
        return;
      }
      req.flash('warning', 'Invalid nickname or password');
      res.code(422).view('session/new', { form: user, flash: res.flash(),/*, error: 'Invalid nickname or password'*/ });
    });
  });

  app.delete('/session', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        res.status(500);
        res.send('Internal Server Error');
      } else {
        res.redirect(app.reverse('root'));
      }
    });
    // delete req.session.userId;
    // res.flash('info', `Good bye, ${res.locals.currentUser.nickname}`);
    // res.redirect(app.reverse('root'));
  });
};
