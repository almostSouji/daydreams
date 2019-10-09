const { Listener } = require('discord-akairo');
const { MESSAGES } = require('../../util/constants');

class ReconnectListener extends Listener {
	constructor() {
		super('reconnecting', {
			emitter: 'client',
			event: 'reconnecting',
			category: 'client'
		});
	}

	exec() {
		this.client.logger.info(MESSAGES.LOGGER('[RECONNECTING]', 'Reconnecting...'));
	}
}

module.exports = ReconnectListener;
