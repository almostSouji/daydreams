const { Client } = require('../../daydream');
const { join } = require('path');

class CaiClient extends Client {
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
}

module.exports = CaiClient;
