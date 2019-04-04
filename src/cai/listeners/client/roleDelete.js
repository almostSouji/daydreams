const { Listener } = require('discord-akairo');
class RoleDeleteListener extends Listener {
	constructor() {
		super('roleDelete', {
			emitter: 'client',
			event: 'roleDelete'
		});
	}

	async exec(role) {
		await this.client.db.models.rolestates.destroy({
			where: {
				guild: role.guild.id,
				role: role.id
			}
		});
	}
}

module.exports = RoleDeleteListener;
