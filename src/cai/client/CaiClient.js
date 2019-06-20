const { Client } = require('../../daydream');
const { join } = require('path');
const Sequelize = require('sequelize');

class CaiClient extends Client {
	constructor() {
		super();
		this.db.define('rolestates', {
			role: Sequelize.TEXT,
			guild: Sequelize.TEXT,
			user: Sequelize.TEXT
		});
		this.commandHandler.loadAll(join(__dirname, '..', 'commands'));
		this.listenerHandler.loadAll(join(__dirname, '..', 'listeners'));
	}
}

module.exports = CaiClient;
