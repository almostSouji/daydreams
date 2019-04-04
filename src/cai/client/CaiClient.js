const { Client } = require('../../daydream');
const { join } = require('path');
const Sequelize = require('sequelize');

class CaiClient extends Client {
	async init() {
		this.db.define('rolestates', {
			role: Sequelize.TEXT,
			guild: Sequelize.TEXT,
			user: Sequelize.TEXT
		});
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
