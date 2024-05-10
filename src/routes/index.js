import courses from './courses.js';
import users from './users.js';
import session from './session.js';
import root from './root.js';

const controllers = [
  courses,
  users,
  session,
  root,
];

export default (app, state) => controllers.forEach((f) => f(app, state));