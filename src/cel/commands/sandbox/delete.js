const { Command } = require('discord-akairo');
const { Guild } = require('discord.js');

class DeleteCommand extends Command {
	constructor() {
		super('delete', {
			aliases: ['delete', 'destroy', '-', 'kill', 'del'],
			description: {
				content: 'Destroy a sandbox',
				usage: '[number]'
			},
			args: [
				{
					'id': 'guild',
					'type': 'string',
					'default': message => message.guild
				},
				{
					id: 'all',
					match: 'flag',
					flag: '--all'
				}
			]
		});
	}

	async exec(msg, { guild, all }) {
		const { sandboxes, user } = this.client;

		if (all && this.client.isOwner(msg.author)) {
			if (!sandboxes.size) {
				return msg.util.send('Amount of test stages: 0');
			}
			for (const g of sandboxes.values()) {
				g.delete();
			}
			return msg.util.send(`Deletion complete`);
		}

		if (!(guild instanceof Guild)) {
			const queryguild = sandboxes.find(val => val.name === `Sandbox ${guild}`);
			if (queryguild) {
				guild = queryguild;
			}
		}
		if (!(guild instanceof Guild)) {
			return msg.util.send(`Target \`${guild}\` could not be identified.`);
		}
		const slot = guild.sandbox;
		if (!slot || guild.ownerID !== user.id) {
			return msg.util.send(`Slot missing from query`);
		}
		try {
			await guild.delete();
			await msg.util.send(`Stage ${slot} annihilated.`);
		} catch (_) {
			msg.util.send(`Slot ${slot} resisted destruction.`)
				.catch(() => { });
		}
	}
}
module.exports = DeleteCommand;
