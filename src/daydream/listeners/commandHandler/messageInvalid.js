const { Listener } = require('discord-akairo');
const { MESSAGES } = require('../../util/constants');

class MessageInvalidListener extends Listener {
	constructor() {
		super('messageInvalid', {
			emitter: 'commandHandler',
			event: 'messageInvalid'
		});
	}

	async exec(msg) {
		if (msg.channel.type === 'dm') {
			if (!this.client.hubGuildID) return;
			const userQuery = await this.client.db.models.users.findOne({ where: { id: msg.author.id } });
			if (!userQuery || !userQuery.channel || !this.client.channels.cache.get(userQuery.channel)) {
				const channel = await this.client.hubGuild.channels.create(`${msg.author.id}`, {
					topic:
					MESSAGES.LISTENERS.MESSAGE_INVALID.TOPIC(this.client.config.emojis.crest, msg.author)
				});

				await this.client.db.models.users.upsert({ id: msg.author.id, channel: channel.id });
				return channel.relayMessage(msg);
			}
			await this.client.channels.get(userQuery.channel).relayMessage(msg);
		}
		if (msg.channel.type === 'text' && msg.guild.id === this.client.hubGuildID) {
			const userQuery = await this.client.db.models.users.findOne({ where: { channel: msg.channel.id } });
			if (!userQuery) return;

			try {
				const user = await this.client.users.fetch(userQuery.id);
				if (!user) {
					throw new Error('invalid user');
				}
				user.relayMessage(msg).catch(() => msg.channel.send(MESSAGES.LISTENERS.MESSAGE_INVALID.NO_CONNECTION(this.client.config.emojis.crest, user)));
			} catch (error) {
				return msg.channel.send(MESSAGES.LISTENERS.MESSAGE_INVALID.NO_RECIPIENT(this.client.config.emojis.crest));
			}
		}
	}
}

module.exports = MessageInvalidListener;
