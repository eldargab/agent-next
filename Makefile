test: node_modules
	@node_modules/.bin/mocha

node_modules: package.json
	@npm install && touch node_modules

.PHONY: test
