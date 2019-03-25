const { Command, Argument } = require('discord-akairo');
const { Op } = require('sequelize');
const { Collection } = require('discord.js');

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
			return msg.util.send('✘ Provide a valid option, either `add` or `delete`.');
		}
		if (!target) {
			return msg.util.send('✘ Provide a valid user to force the rolestate update on.');
		}
		if (!roles.length) {
			return msg.util.send(`✘ Provide at least one valid role to ${option === 'add' ? 'add to' : 'delete from'} the users rolestate.`);
		}
		const members = await msg.guild.members.fetch();
		if (typeof target === 'string') {
			try {
				target = this.client.users.get(target) || await this.client.users.fetch(target);
			} catch (err) {
				return msg.util.send(`✘ Invalid user: \`${target}\``);
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
			return msg.util.send(`✘ ${option === 'add' ? 'All' : 'None'} of the provided roles exist in rolestate for \`${target.tag}\`.`);
		}

		await msg.util.send(`${msg.author} Are you sure you want to force ${option} the role${validRoles.size > 1 ? 's' : ''} \`${validNames.join(', ')}\` ${option === 'add' ? 'to' : 'from'} \`${target.tag}\`'s rolestate?${invalidRoles.size ? ` The following role${invalidRoles.size > 1 ? 's' : ''} can not be ${option === 'add' ? 'added' : 'removed'}: \`${invalidNames.join(', ')}\`.` : ''}${members.has(target.id) ? ' The target is a member of this server. Changing their roles will overwrite this action' : ''}. (y/n)`);
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
				}
				return msg.util.send(`✓ Rolestate record${validRoles.size > 1 ? 's' : ''} for \`${target.tag}\` and role${validRoles.size > 1 ? 's' : ''} \`${validNames.join(', ')}\` successfully ${option === 'add' ? 'created' : 'deleted'}.`);
			}
			throw new Error('Negative user input');
		} catch (err) {
			return msg.util.send(`✘ Action canceled${err.message === 'Negative user input' ? '' : ' (timeout)'}`);
		}
	}
}
module.exports = ForceRoleSateCommand;
