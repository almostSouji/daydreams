const { Listener } = require('discord-akairo');
const { Op } = require('sequelize');

class GuildMemberUpdateListener extends Listener {
	constructor() {
		super('guildMemberUpdate', {
			emitter: 'client',
			event: 'guildMemberUpdate'
		});
	}

	async exec(oldMember, newMember) {
		const roleState = this.client.guildSettings.get(newMember.guild.id, 'roleState');
		const hasAdditions = newMember.roles.keyArray().some(r => !oldMember.roles.has(r));
		const hasDeletions = oldMember.roles.keyArray().some(r => !newMember.roles.has(r));

		if (roleState && (hasAdditions || hasDeletions)) {
			await newMember.guild.members.fetch(newMember.id);
			const newRoleKeys = newMember.roles.filter(r => r.id !== newMember.guild.id).keyArray();
			const currentState = await this.client.db.models.rolestates.findAll({
				where: {
					user: newMember.id,
					guild: newMember.guild.id
				}
			});
			const currentStateIDs = currentState.map(data => data.role);

			await this.client.db.models.rolestates.destroy({
				where: {
					user: newMember.id,
					guild: newMember.guild.id,
					role: {
						[Op.notIn]: newRoleKeys
					}

				}
			});

			const records = [];
			for (const key of newRoleKeys.filter(k => !currentStateIDs.includes(k))) {
				records.push({
					role: key,
					guild: newMember.guild.id,
					user: newMember.id
				});
			}
			await this.client.db.models.rolestates.bulkCreate(records);
		}
	}
}

module.exports = GuildMemberUpdateListener;
