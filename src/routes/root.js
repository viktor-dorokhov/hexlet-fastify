export default (app) => {
  // exercise 3
  app.get('/', { name: 'root' }, (req, res) => {
    // res.send('Welcome to Hexlet!');
    // exercise 18
    const visited = req.cookies.visited;
    res.cookie('visited', true);
    // exercise 7
    // console.log(res.flash('success'));
    const flash = res.flash();
    // console.log(flash);
    res.view('index', { visited, userId: req.session.userId, flash });
  });
};