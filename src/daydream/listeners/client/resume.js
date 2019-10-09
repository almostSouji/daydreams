const { Listener } = require('discord-akairo');
const { MESSAGES } = require('../../util/constants');

class ResumeListener extends Listener {
	constructor() {
		super('resumed', {
			emitter: 'client',
			event: 'resumed',
			category: 'client'
		});
	}

	exec(events) {
		this.client.logger.info(MESSAGES.LOGGER('[RESUME]', MESSAGES.LISTENERS.RESUMED(events)));
	}
}

module.exports = ResumeListener;
