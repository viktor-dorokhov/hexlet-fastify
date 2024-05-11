console:
	@node-console

test:
	npm test -s

start-watch:
	npx nodemon bin/index.js

start:
	node bin/index.js

