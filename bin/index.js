import build from '../src/index.js';

const port = 3000;
const app = await build();

app.listen({ port }, () => {
  console.log(`Example app listening on port ${port}`);
});
