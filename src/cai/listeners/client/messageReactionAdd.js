const { Listener } = require('discord-akairo');
const { Util } = require('../../../daydream');

class MessageReactionAddListener extends Listener {
	constructor() {
		super('messageReactionAdd', {
			emitter: 'client',
			event: 'messageReactionAdd'
		});
	}

	async exec(reaction, user) {
		const { message, emoji } = reaction;
		const reactionCommand = this.client.config.reactionCommands[emoji.id] || this.client.config.reactionCommands[emoji.name];
		if (!reactionCommand) return;
		const { guild, channel, author: target } = message;
		if (reactionCommand === 'channel_mute') {
			if (!channel.type === 'text') return;
			if (!channel.permissionsFor(this.client.user).has(['MANAGE_ROLES', 'VIEW_CHANNEL', 'ADD_REACTIONS'])) return;
			try {
				const member = await guild.members.fetch(user);
				if (!channel.permissionsFor(member).has(['MANAGE_ROLES'])) return;
				const options = { SEND_MESSAGES: false, ADD_REACTIONS: false };
				await channel.updateOverwrite(target, options, `channel mute by ${member.user.tag} (${member.id})`);
				await message.react('✔');
				await Util.sleep(2000);
				return message.reactions.removeAll();
			} catch (_) {
				await message.react('❌');
				await Util.sleep(2000);
				return message.reactions.removeAll();
			}
		}
		if (reactionCommand === 'check_member') {
			if (!channel.type === 'text') return;
			if (!channel.permissionsFor(this.client.user).has(['MANAGE_MESSAGES', 'ADD_REACTIONS', 'VIEW_CHANNEL'])) return;
			try {
				await message.guild.members.fetch(message.author);
				await message.react('✔');
				await Util.sleep(2000);
				return message.reactions.removeAll();
			} catch (_) {
				await message.react('❌');
				await Util.sleep(2000);
				return message.reactions.removeAll();
			}
		}
	}
}

module.exports = MessageReactionAddListener;
