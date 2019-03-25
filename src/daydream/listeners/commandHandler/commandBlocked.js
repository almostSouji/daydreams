const { Listener } = require('discord-akairo');

class CommandBlockedListener extends Listener {
	constructor() {
		super('commandBlocked', {
			emitter: 'commandHandler',
			event: 'commandBlocked'
		});
	}

	exec(msg, command, reason) {
		if (reason === 'guild') {
			msg.util.send('✘ This command is not available in direct messages.');
		}
	}
}

module.exports = CommandBlockedListener;
