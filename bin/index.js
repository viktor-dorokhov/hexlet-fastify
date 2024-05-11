import build from '../src/index.js';

const port = process.env.PORT || 3000;
const app = await build();

app.listen({ port }, () => {
  console.log(`Example app listening on port ${port}`);
});
