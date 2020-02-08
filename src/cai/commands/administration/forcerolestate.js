const { Command, Argument } = require('discord-akairo');
const { Op } = require('sequelize');
const { Collection } = require('discord.js');
const { DAYDREAM, MESSAGES } = require('../../util/constants');

class ForceRoleSateCommand extends Command {
	constructor() {
		super('forcerolestate', {
			aliases: ['forcerolestate', 'frs', 'forcerole'],
			description: {
				content: 'Force a rolestate into records',
				usage: '<add|delete> <member> <role...>'
			},
			args: [
				{
					id: 'option',
					type: ['add', 'delete']
				},
				{
					id: 'target',
					type: Argument.union('user', 'string')
				},
				{
					id: 'roles',
					match: 'separate',
					type: 'role'
				}
			],
			userPermissions: ['MANAGE_GUILD'],
			channel: 'guild'
		});
	}

	async exec(msg, { option, target, roles }) {
		if (!option) {
			return msg.util.send(MESSAGES.COMMANDS.FORCE_ROLESTATE.ERRORS.INVALID_OPTION);
		}
		if (!target) {
			return msg.util.send(MESSAGES.COMMANDS.FORCE_ROLESTATE.ERRORS.INVALID_USER);
		}
		if (!roles.length) {
			if (option === 'add') {
				return msg.util.send(MESSAGES.COMMANDS.FORCE_ROLESTATE.ERRORS.ROLES_ADD);
			}
			return msg.util.send(MESSAGES.COMMANDS.FORCE_ROLESTATE.ERRORS.ROLES_REMOVE);
		}
		const members = await msg.guild.members.fetch();
		if (typeof target === 'string') {
			try {
				target = await this.client.users.fetch(target);
			} catch (err) {
				return msg.util.send(DAYDREAM.MESSAGES.ERRORS.RESOLVE(target, 'user'));
			}
		}
		const currentState = await this.client.db.models.rolestates.findAll({
			where: {
				user: target.id,
				guild: msg.guild.id
			}
		});
		const currentStateIDs = currentState.map(data => data.role);

		const roleCollection = new Collection();
		for (const role of roles) {
			if (role) {
				roleCollection.set(role.id, role);
			}
		}
		const partition = roleCollection.partition(r => currentStateIDs.includes(r.id));

		const validRoles = option === 'add' ? partition[1] : partition[0];
		const invalidRoles = option === 'add' ? partition[0] : partition[1];
		const validNames = validRoles.map(r => r.name);
		const invalidNames = invalidRoles.map(r => r.name);

		if (!validRoles.size) {
			if (option === 'add') {
				return msg.util.send(MESSAGES.COMMANDS.FORCE_ROLESTATE.ERRORS.ALL(target.tag));
			}
			return msg.util.send(MESSAGES.COMMANDS.FORCE_ROLESTATE.ERRORS.NONE(target.tag));
		}

		await msg.util.send(MESSAGES.COMMANDS.FORCE_ROLESTATE.PROMPT(target.tag, option, validNames.join(', ') || 'none', invalidNames.join(', ') || 'none', members.has(target.id)));
		const filter = m => m.author.id === msg.author.id && ['y', 'yes', 'n', 'no'].includes(m.content.toLowerCase());
		try {
			const collected = await msg.channel.awaitMessages(filter, { max: 1, time: 20000, errors: ['time'] });
			if (['yes', 'y'].includes(collected.first().content)) {
				if (option === 'add') {
					const records = [];
					for (const role of validRoles.values()) {
						records.push({
							role: role.id,
							guild: msg.guild.id,
							user: target.id
						});
					}
					await this.client.db.models.rolestates.bulkCreate(records);
					return msg.util.send(MESSAGES.COMMANDS.FORCE_ROLESTATE.SUCCESS.ADD(target.tag, validNames.join(', ')));
				}
				if (option === 'delete') {
					await this.client.db.models.rolestates.destroy({
						where: {
							role: {
								[Op.in]: validRoles.keyArray()
							},
							guild: msg.guild.id,
							user: target.id
						}
					});
					return msg.util.send(MESSAGES.COMMANDS.FORCE_ROLESTATE.SUCCESS.REMOVE(target.tag, validNames.join(', ')));
				}
			}
			throw new Error('Negative user input');
		} catch (err) {
			return msg.util.send(MESSAGES.COMMANDS.FORCE_ROLESTATE.ERRORS.CANCELED(err.message === 'Negative user input'));
		}
	}
}
module.exports = ForceRoleSateCommand;
