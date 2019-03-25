const { Structures } = require('discord.js');

module.exports = Structures.extend('Guild', Guild => {
	class DaydreamGuild extends Guild {
		constructor(client, data) {
			super(client, data);
			this.lockedUsers = new Set();
		}

		get isHub() {
			return this.id === this.client.hubGuildID;
		}
	}

	return DaydreamGuild;
});
