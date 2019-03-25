const { Listener } = require('discord-akairo');
class GuildMemberAddListener extends Listener {
	constructor() {
		super('guildMemberAdd', {
			emitter: 'client',
			event: 'guildMemberAdd'
		});
	}

	async exec(member) {
		const botMember = member.guild.me || await member.guild.fetchMember(this.client.user.id);
		if (!botMember.hasPermission('MANAGE_ROLES')) return;
		const { db } = this.client;
		const result = await db.models.rolestates.findAll({
			where: {
				user: member.id,
				guild: member.guild.id
			},
			attributes: ['role']
		});
		const roles = result.map(e => e.role);
		const filtered = roles.filter(r => member.guild.roles.has(r) && botMember.roles.highest.comparePositionTo(r) > 0);
		return member.roles.add(filtered, 'Restoring rolestate');
	}
}

module.exports = GuildMemberAddListener;
