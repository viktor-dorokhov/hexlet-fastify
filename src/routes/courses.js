import _ from 'lodash';
import * as yup from 'yup';
import { matchValue } from '../utils.js';

export default (app, db) => {
  // exercise 6
  app.get('/courses/new', { name: 'courseNew' }, (req, res) => {
    // res.send('Course build');
    res.view('courses/new', { form: {} });
  });
  
  // see below
  /* app.get('/courses/:id', (req, res) => {
    res.send(`Course ID: ${req.params.id}`);
  }); */

  // exercise 7
  app.get('/courses', { name: 'courses' }, (req, res) => {
    const { title, desc } = req.query;
    let wherePart = '';
    const params = [];
    if (title) {
      wherePart += ' title LIKE ?';
      params.push(`%${title}%`);
    }
    if (desc) {
      wherePart += `${wherePart ? ' AND': ''} description LIKE ?`;
      params.push(`%${desc}%`);
    }
    wherePart = wherePart ? ` WHERE ${wherePart}`: '';
    db.all(`SELECT * FROM courses ${wherePart}`, params, (error, courses) => {
      if (error) {
        res.status(500).send(new Error(error));
        return;
      }
      const data = {
        courses: courses || [],
        header: 'Курсы по программированию',
        form: req.query,
      };
  
      res.view('courses/index', data);
    });
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
  
      res.view('courses/new', data);
      return;
    }

    const course = {
      id: _.uniqueId(),
      title: req.body.title.trim(),
      description: req.body.desc,
    };

    const stmt = db.prepare('INSERT INTO courses (title, description) VALUES (?, ?)');
    stmt.run([course.title, course.description], function (error) {
      if (error) {
        res.status(500).send(new Error(error));
        return;
      }
      // res.redirect(`/courses/${this.lastID}`);
      res.redirect(app.reverse('courses'));
    });
  });

  app.get('/courses/:id', { name: 'courseShow' }, (req, res) => {
    const { id } = req.params;
    db.get(`SELECT * FROM courses WHERE id = ?`, [id], (error, course) => {
      if (error) {
        res.status(500).send(new Error(error));
        return;
      }
      if (!course) {
        res.code(404).send({ message: 'Course not found' });
      } else {
        res.view('courses/show', { course });
      }
    });
  });
};