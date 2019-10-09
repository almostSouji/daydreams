const { Command } = require('discord-akairo');
const { MESSAGES } = require('../../util/constants');

class PrefixCommand extends Command {
	constructor() {
		super('prefix', {
			aliases: ['prefix'],
			editable: true,
			description: {
				content: 'Change prefix, `--reset` to reset to default',
				usage: '[new prefix]'
			},
			channel: 'guild',
			args: [
				{
					id: 'prefix',
					type: 'string'
				},
				{
					id: 'sudo',
					match: 'flag',
					flag: ['--force', '--f', '--sudo']
				},
				{
					id: 'reset',
					match: 'flag',
					flag: ['--rest', '--r']
				}
			]
		});
	}

	async exec(msg, { prefix, sudo, reset }) {
		const defaultPrefix = this.client.config.prefix;
		if (msg.channel.type !== 'text') {
			return msg.util.send(MESSAGES.COMMANDS.PREFIX.DM(defaultPrefix));
		}
		const override = this.client.isOwner(msg.author) && sudo;
		const oldPrefix = this.client.guildSettings.get(msg.guild.id, 'prefix', defaultPrefix);
		if (!prefix || (!msg.member.hasPermission('MANAGE_GUILD') && !override)) {
			return msg.util.send(MESSAGES.COMMANDS.PREFIX.CURRENT(oldPrefix));
		}
		if (reset) {
			await this.client.guildSettings.set(msg.guild.id, 'prefix', defaultPrefix);
			return msg.util.send(MESSAGES.COMMANDS.PREFIX.RESET(defaultPrefix, msg.guild.name));
		}
		await this.client.guildSettings.set(msg.guild.id, 'prefix', prefix);
		return msg.util.send(MESSAGES.COMMANDS.PREFIX.CHANGE(oldPrefix, prefix, msg.guild.name));
	}
}
module.exports = PrefixCommand;
