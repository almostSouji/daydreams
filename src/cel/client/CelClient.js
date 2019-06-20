const { Client } = require('../../daydream');
const { join } = require('path');
const { readdirSync } = require('fs');

class CelClient extends Client {
	constructor() {
		super();
		this.commandHandler.loadAll(join(__dirname, '..', 'commands'));
		this.listenerHandler.loadAll(join(__dirname, '..', 'listeners'));
	}

	get sandboxes() {
		return this.guilds
			.filter(g => g.sandbox)
			.sort((a, b) => a.sandbox - b.sandbox);
	}
}

const extensions = readdirSync(join(__dirname, '..', 'extensions'));
for (const ext of extensions) {
	require(join(__dirname, '..', 'extensions', ext));
}

module.exports = CelClient;
