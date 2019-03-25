const { Listener } = require('discord-akairo');

class MissingPermissionsListener extends Listener {
	constructor() {
		super('missingPermissions', {
			emitter: 'commandHandler',
			event: 'missingPermissions'
		});
	}

	exec(msg, command, type, missing) {
		msg.util.send(`✘ ${type === 'client' ? 'I' : 'You'} need the permission${missing.length > 1 ? 's' : ''} ${missing.map(p => `\`${p}\``)} to execute the command \`${command}\`.`);
	}
}

module.exports = MissingPermissionsListener;
