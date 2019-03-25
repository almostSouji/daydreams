const { Structures } = require('discord.js');

module.exports = Structures.extend('TextChannel', TextChannel => {
	class DaydreamTextChannel extends TextChannel {
		relayMessage(message) {
			const additions = [];
			for (const embed of message.embeds) {
				additions.push(embed);
			}
			for (const attachment of message.attachments.values()) {
				additions.push(attachment);
			}
			return this.send(message.content, additions);
		}
	}

	return DaydreamTextChannel;
});
