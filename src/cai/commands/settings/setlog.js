const { Command, Argument } = require('discord-akairo');
const { TextChannel } = require('discord.js');

class LogSettingCommand extends Command {
	constructor() {
		super('setlog', {
			aliases: ['setlog', 'log', 'setlogchannel'],
			editable: true,
			description: {
				content: 'Set a logchannel, (`--disable` to disable logging)',
				usage: '[channel] [--disable]'
			},
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			args: [
				{
					id: 'channel',
					type: Argument.union('textChannel', 'string')
				},
				{
					id: 'reset',
					match: 'flag',
					flag: ['--reset', '--r', '--disable', '--off']
				}
			]
		});
	}

	exec(msg, { channel, reset }) {
		const logChannel = this.client.guildSettings.get(msg.guild.id, 'logChannel');

		if (reset) {
			if (!logChannel) {
				return msg.util.send(`✘ No logchannel found for \`${msg.guild.name}\`.`);
			}
			this.client.guildSettings.set(msg.guild.id, 'logChannel', null);
			return msg.util.send(`✓ Disabled logging on \`${msg.guild.name}\`.`);
		}

		if (!(channel instanceof TextChannel)) {
			return msg.util.send(`✘ Can not convert \`${channel}\` to \`textchannel\`.`);
		}
		if (!channel.permissionsFor(msg.guild.me).has(['MANAGE_WEBHOOKS', 'VIEW_CHANNEL', 'SEND_MESSAGES'])) {
			return msg.util.send(`✘ I don't have permission to send or create webhooks in ${channel}.`);
		}

		this.client.guildSettings.set(msg.guild.id, 'logChannel', channel.id);
		return msg.util.send(`✓ Logchannel on \`${msg.guild.name}\` set to ${channel}.`);
	}
}
module.exports = LogSettingCommand;
