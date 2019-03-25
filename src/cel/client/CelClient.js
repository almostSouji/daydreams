const { Client } = require('../../daydream');
const { join } = require('path');
const { readdirSync } = require('fs');

class CelClient extends Client {
	async init() {
		this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
		this.commandHandler.useListenerHandler(this.listenerHandler);
		this.commandHandler.loadAll();
		this.commandHandler.loadAll(join(__dirname, '..', 'commands'));
		this.inhibitorHandler.loadAll();
		this.listenerHandler.loadAll();
		this.listenerHandler.loadAll(join(__dirname, '..', 'listeners'));
		await this.guildSettings.init();
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
