const { Command } = require('discord-akairo');

class PingCommand extends Command {
	constructor() {
		super('ping', {
			aliases: ['ping'],
			description: {
				content: 'Display response time',
				usage: ''
			},
			cooldown: 5000,
			ratelimit: 2
		});
	}

	async exec(msg) {
		const ping = await msg.util.send('awaiting ping...');
		msg.util.send(`✓ pong! Api Latency is ${ping.createdTimestamp - msg.createdTimestamp}ms. Av. Heartbeat is ${Math.round(this.client.ws.ping)}ms.`);
	}
}
module.exports = PingCommand;
