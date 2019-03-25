const { Structures } = require('discord.js');

module.exports = Structures.extend('User', User => {
	class DaydreamUser extends User {
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

	return DaydreamUser;
});
