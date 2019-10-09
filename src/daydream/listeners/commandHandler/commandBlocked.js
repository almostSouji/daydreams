const { Listener } = require('discord-akairo');
const { MESSAGES } = require('../../util/constants');

class CommandBlockedListener extends Listener {
	constructor() {
		super('commandBlocked', {
			emitter: 'commandHandler',
			event: 'commandBlocked'
		});
	}

	exec(msg, command, reason) {
		if (reason === 'guild') {
			msg.util.send(MESSAGES.LISTENERS.COMMAND_BLOCKED.GUILD_ONLY(command.id));
		}
	}
}

module.exports = CommandBlockedListener;
