const { Listener } = require('discord-akairo');

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
			if (!userQuery || !userQuery.channel || !this.client.channels.get(userQuery.channel)) {
				const channel = await this.client.hubGuild.channels.create(`${msg.author.id}`, { topic: `${this.client.config.emojis.crest} DM with: ${msg.author} | ${msg.author.tag} (${msg.author.id})` });

				await this.client.db.models.users.upsert({ id: msg.author.id, channel: channel.id });
				return channel.relayMessage(msg);
			}
			await this.client.channels.get(userQuery.channel).relayMessage(msg);
		}
		if (msg.channel.type === 'text' && msg.guild.id === this.client.hubGuildID) {
			const userQuery = await this.client.db.models.users.findOne({ where: { channel: msg.channel.id } });
			if (!userQuery) return;

			const user = this.client.users.get(userQuery.id);
			if (!user) {
				return msg.channel.send(`${this.client.config.emojis.fail} Recipient not found`);
			}
			user.relayMessage(msg).catch(() => msg.channel.send(`${this.client.config.emojis.fail} Connection to \`${user.tag}\` could not be established.`));
		}
	}
}

module.exports = MessageInvalidListener;
