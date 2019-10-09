const { Listener } = require('discord-akairo');
const { MESSAGES } = require('../../util/constants');

class ReadyListener extends Listener {
	constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready'
		});
	}

	exec() {
		this.client.logger.info(MESSAGES.LOGGER('[LOGIN]', MESSAGES.LISTENERS.LOGIN.LOG(this.client)));
	}
}

module.exports = ReadyListener;
