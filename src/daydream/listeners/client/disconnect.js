const { Listener } = require('discord-akairo');
const { MESSAGES } = require('../../util/constants');

class DisconnectListener extends Listener {
	constructor() {
		super('disconnect', {
			emitter: 'client',
			event: 'disconnect',
			category: 'client'
		});
	}

	exec(event) {
		this.client.logger.warn(MESSAGES.LOGGER('[DISCONNECT]', MESSAGES.LISTENERS.DISCONNECT.LOG(event.code)));
	}
}

module.exports = DisconnectListener;
