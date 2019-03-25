const { Listener } = require('discord-akairo');

class CelReadyListener extends Listener {
	constructor() {
		super('celready', {
			emitter: 'client',
			event: 'ready'
		});
	}

	exec() {
		this.client.user.setActivity('over sandboxes', { type: 'WATCHING' });
	}
}

module.exports = CelReadyListener;
