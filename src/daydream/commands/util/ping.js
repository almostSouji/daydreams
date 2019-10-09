const { Command } = require('discord-akairo');
const { MESSAGES } = require('../../util/constants');

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
		const ping = await msg.util.send(MESSAGES.COMMANDS.PING.WAITING);
		msg.util.send(MESSAGES.COMMANDS.PING.SUCCESS(ping.createdTimestamp - msg.createdTimestamp, Math.round(this.client.ws.ping)));
	}
}
module.exports = PingCommand;
