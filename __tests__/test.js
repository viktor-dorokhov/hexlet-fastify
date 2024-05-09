// @ts-check

import axios from 'axios';

test('Run server', async () => {
  const response = await axios('http://localhost:8080');
  expect(response.data).toBe('Welcome to Hexlet!');
});
