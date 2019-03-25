const { Listener } = require('discord-akairo');
const { stripIndents } = require('common-tags');
class ReadyListener extends Listener {
	constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready'
		});
	}

	exec() {
		this.client.logger.info(stripIndents`Logged in as ${this.client.user.tag} (${this.client.user.id}).`);
	}
}

module.exports = ReadyListener;
