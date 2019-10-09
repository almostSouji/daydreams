const { Listener } = require('discord-akairo');
const { MESSAGES } = require('../../util/constants');

class CooldownListener extends Listener {
	constructor() {
		super('cooldown', {
			emitter: 'commandHandler',
			event: 'cooldown'
		});
	}

	exec(msg, command, remaining) {
		msg.util.send(MESSAGES.LISTENERS.COOLDOWN.TRY_AGAIN_IN(parseFloat((remaining / 1000).toFixed(2))));
	}
}

module.exports = CooldownListener;
