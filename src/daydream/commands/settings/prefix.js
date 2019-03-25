const { Command } = require('discord-akairo');

class PrefixCommand extends Command {
	constructor() {
		super('prefix', {
			aliases: ['prefix'],
			editable: true,
			description: {
				content: 'Change prefix, `--reset` to reset to default',
				usage: '[new prefix]'
			},
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
			return msg.util.send(`You can use the standard prefix \`${defaultPrefix}\` in direct messages.`);
		}
		const override = this.client.isOwner(msg.author) && sudo;
		const oldPrefix = this.client.guildSettings.get(msg.guild.id, 'prefix', defaultPrefix);
		if (!prefix || (!msg.member.hasPermission('MANAGE_GUILD') && !override)) {
			return msg.util.send(`My prefix here is \`${oldPrefix}\`.\nAlternatively you can mention me.`);
		}
		if (reset) {
			await this.client.guildSettings.set(msg.guild.id, 'prefix', defaultPrefix);
			return msg.util.send(`Prefix on \`${msg.guild.name}\` reset to \`${defaultPrefix}\`.`);
		}
		await this.client.guildSettings.set(msg.guild.id, 'prefix', prefix);
		return msg.util.send(`Prefix on \`${msg.guild.name}\` changed from \`${oldPrefix}\` to \`${prefix}\`.`);
	}
}
module.exports = PrefixCommand;
