const { Listener } = require('discord-akairo');

class GuildMemberRemoveListener extends Listener {
	constructor() {
		super('guildMemberRemove', {
			emitter: 'client',
			event: 'guildMemberRemove'
		});
	}

	async exec(member) {
		const channelID = this.client.guildSettings.get(member.guild.id, 'waveChannel');
		if (!channelID) {
			return;
		}
		const channel = member.guild.channels.cache.get(channelID);
		if (!channel) {
			return;
		}
		if (!channel.permissionsFor(this.client.user).has(['ADD_REACTIONS', 'READ_MESSAGE_HISTORY'])) {
			return;
		}
		const msgs = await channel.messages.fetch({ limit: 100 });
		for (const [_, val] of msgs) {
			if (val.mentions.users.has(member.id)) {
				return val.react('👋');
			}
		}
	}
}

module.exports = GuildMemberRemoveListener;
