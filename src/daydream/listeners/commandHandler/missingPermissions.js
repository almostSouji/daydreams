const { Listener } = require('discord-akairo');
const { MESSAGES } = require('../../util/constants');

class MissingPermissionsListener extends Listener {
	constructor() {
		super('missingPermissions', {
			emitter: 'commandHandler',
			event: 'missingPermissions'
		});
	}

	exec(msg, command, type, missing) {
		const missinFormatted = missing.map(p => `\`${p}\``);
		if (type === 'client') {
			return msg.util.send(MESSAGES.LISTENERS.MISSING_PERMISSIONS.BOT(missinFormatted, command.id));
		}
		return msg.util.send(MESSAGES.LISTENERS.MISSING_PERMISSIONS.USER(missinFormatted, command.id));
	}
}

module.exports = MissingPermissionsListener;
