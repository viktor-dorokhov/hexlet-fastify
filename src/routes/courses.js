import _ from 'lodash';
import * as yup from 'yup';
import { matchValue } from '../utils.js';

export default (app, state) => {
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
    let filteredCourses = state.courses;
    const { title: filterTitle, desc: filterDesc } = req.query;
    if (filterTitle) {
      filteredCourses = filteredCourses.filter(({ title }) => matchValue(title, filterTitle));
    }
    if (filterDesc) {
      filteredCourses = filteredCourses.filter(({ description }) => matchValue(description, filterDesc));
    }
    const data = {
      courses: filteredCourses, // Где-то хранится список курсов
      header: 'Курсы по программированию',
      form: req.query,
    };
    res.view('courses/index', data);
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
  
    state.courses.push(course);
  
    // res.redirect('/courses');
    res.redirect(app.reverse('courses'));
  });

  app.get('/courses/:id', { name: 'courseShow' }, (req, res) => {
    const { id } = req.params
    const course = state.courses.find(({ id: courseId }) => courseId === id);
    if (!course) {
      res.code(404).send({ message: 'Course not found' });
      return;
    }
    const data = {
      course,
    };
    res.view('courses/show', data);
  });
};