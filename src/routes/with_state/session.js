import encrypt from '../encrypt.js';

export default (app, state) => {
  // exercise 4
  app.get('/session/new', { name: 'sessionNew' }, (req, res) => {
    res.view('session/new', { form: {} });
  });

  app.post('/session', (req, res) => {
    const { nickname, password } = req.body;
    const user = state.users.find((nUser) => nUser.name === nickname);
    if (user && user.password === encrypt(password)) {
      req.session.userId = user.id;
      // res.flash('info', `Welcome, ${user.nickname}!`);
      req.flash('success', 'Пользователь залогинен');
      res.redirect(app.reverse('root'));
      return;
    }
    res.status(422);
    req.flash('warning', 'Invalid nickname or password');
    res.code(422).view('session/new', { form: req.body, flash: res.flash(),/*, error: 'Invalid nickname or password'*/ });
  });

  app.get('/session/delete', { name: 'sessionDelete' }, (req, res) => {
    delete req.session.userId;
    // res.flash('info', `Good bye, ${res.locals.currentUser.nickname}`);
    res.redirect(app.reverse('root'));
  });

};
