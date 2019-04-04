const { Client } = require('../../daydream');
const { join } = require('path');
const Dataresolver = require('../util/DatarResolver');
const XIVAPI = require('xivapi-js');
const Resolver = require('../util/DatarResolver');

class XivClient extends Client {
	constructor(config) {
		super(config);
		this.xiv = new XIVAPI({
			private_key: config.xivkey,
			verbose: true,
			language: 'en'
		});
		this.xivapi = 'https://xivapi.com';
		this.xivresolver = new Resolver(this.xiv);
	}

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

module.exports = XivClient;
