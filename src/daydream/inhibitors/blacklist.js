const { Inhibitor } = require('discord-akairo');

class BlacklistInhibitor extends Inhibitor {
	constructor() {
		super('blacklist', { reason: 'blacklist' });
	}

	async exec(message) {
		const result = await this.client.db.models.blacklist.findOne({
			where: {
				user: message.author.id
			}
		});
		return Boolean(result);
	}
}

module.exports = BlacklistInhibitor;
