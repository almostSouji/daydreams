const { Command, Argument } = require('discord-akairo');
const { TextChannel } = require('discord.js');

class WaveSettingCommand extends Command {
	constructor() {
		super('setwave', {
			aliases: ['setwave', 'wave', 'setwavechannel'],
			editable: true,
			description: {
				content: 'Set a wave channel, (`--disable` to disable waving)',
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
		const logChannel = this.client.guildSettings.get(msg.guild.id, 'waveChannel');

		if (reset) {
			if (!logChannel) {
				return msg.util.send(`✘ No WaveChannel found for \`${msg.guild.name}\`.`);
			}
			this.client.guildSettings.set(msg.guild.id, 'waveChannel', null);
			return msg.util.send(`✓ Disabled waving on \`${msg.guild.name}\`.`);
		}

		if (!(channel instanceof TextChannel)) {
			return msg.util.send(`✘ Can not convert \`${channel}\` to \`textchannel\`.`);
		}
		if (!channel.permissionsFor(msg.guild.me).has(['READ_MESSAGE_HISTORY', 'ADD_REACTIONS'])) {
			return msg.util.send(`✘ I don't have permission to fetch message history or add reactions in ${channel}.`);
		}

		this.client.guildSettings.set(msg.guild.id, 'waveChannel', channel.id);
		return msg.util.send(`✓ WaveChannel on \`${msg.guild.name}\` set to ${channel}.`);
	}
}
module.exports = WaveSettingCommand;
