import _ from 'lodash';

import encrypt from './encrypt.js';

const state = {
  users: [
    {
      name: 'user',
      email: 'user@gmail.com',
      password: encrypt('123'),
    },
    {
      name: 'user2',
      email: 'user2@gmail.com',
      password: encrypt('123'),
    },
  ],
  courses: [
    {
      title: 'JS: Массивы',
      description: 'Курс про массивы в JavaScript',
    },
    {
      title: 'JS: Функции',
      description: 'Курс про функции в JavaScript',
    },
  ],
};

export default (db) => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE courses (
        id INTEGER PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT
      );
    `);

    db.run(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL
      );
    `);
  });

  const stmtCourses = db.prepare('INSERT INTO courses (title, description) VALUES (?, ?)');

  state.courses.forEach((course) => {
    stmtCourses.run(course.title, course.description);
  });

  stmtCourses.finalize();

  const stmtUsers = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');

  state.users.forEach((user) => {
    stmtUsers.run(user.name, user.email, user.password);
  });

  stmtUsers.finalize();
};