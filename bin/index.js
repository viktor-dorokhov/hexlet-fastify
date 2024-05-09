import build from '../src/index.js';

const port = 3000;
const app = build();

app.listen({ port }, () => {
  console.log(`Example app listening on port ${port}`);
});
