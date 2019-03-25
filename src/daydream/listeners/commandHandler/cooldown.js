const { Listener } = require('discord-akairo');

class CooldownListener extends Listener {
	constructor() {
		super('cooldown', {
			emitter: 'commandHandler',
			event: 'cooldown'
		});
	}

	exec(msg, command, remaining) {
		msg.util.send(`✘ Try again in ${parseFloat((remaining / 1000).toFixed(2))}s`);
	}
}

module.exports = CooldownListener;
