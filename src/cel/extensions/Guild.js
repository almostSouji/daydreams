const { Structures } = require('discord.js');

module.exports = Structures.extend('Guild', Guild => {
	class DaydreamGuild extends Guild {
		constructor(client, data) {
			super(client, data);
			this._sandboxRegex = /Sandbox (\d+)\b/;
		}

		get sandbox() {
			const match = this.name.match(this._sandboxRegex);
			if (match) return match[1];
			return null;
		}
	}

	return DaydreamGuild;
});
