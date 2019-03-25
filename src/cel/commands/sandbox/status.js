const { Command } = require('discord-akairo');

class SandboxStatusCommand extends Command {
	constructor() {
		super('status', {
			aliases: ['status', 'color'],
			description: {
				content: 'Set sandbox Status',
				usage: '[default|online|idle|dnd>]'
			},
			args: [
				{
					'id': 'status',
					'type': ['offline', 'online', 'idle', 'dnd'],
					'default': 'offline'
				}
			]
		});
	}

	async exec(msg, { status }) {
		if (!msg.guild.sandbox) return;
		await msg.guild.setIcon(this.client.config.icons[status]);
		msg.util.send(`Status icon of \`${msg.guild.name}\` set to \`${status}\`.`);
	}
}
module.exports = SandboxStatusCommand;
