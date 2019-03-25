const { Command, Argument } = require('discord-akairo');
const DaydreamEmbed = require('../../structures/DaydreamEmbed');
const { stripIndents } = require('common-tags');
const { GuildMember } = require('discord.js');
const { Op } = require('sequelize');

class RoleStateCommand extends Command {
	constructor() {
		super('rolestate', {
			aliases: ['rolestate', 'rs'],
			description: {
				content: 'Toggle rolestate on this server, provide a user to show their rolestate information (`--update` to update rolestate after an outage, `--enable` and `--disable` to force rolestate without toggle)',
				usage: '[user] [--update] [--enable] [--disable]'
			},
			args: [
				{
					id: 'target',
					type: Argument.union('member', 'string')
				},
				{
					id: 'update',
					match: 'flag',
					flag: ['--update', '--up', '--u']
				},
				{
					id: 'enable',
					match: 'flag',
					flag: ['--enable', '-activate', '--e']
				},
				{
					id: 'disable',
					match: 'flag',
					flag: ['--disable', '--deactivate', '--d']
				}
			],
			userPermissions: ['MANAGE_GUILD'],
			channel: 'guild'
		});
	}

	async exec(msg, { target, update, enable, disable }) {
		const botMember = msg.guild.me || await msg.guild.fetchMember(this.client.user);
		const roleState = this.client.guildSettings.get(msg.guild.id, 'roleState');
		const members = await msg.guild.members.fetch();
		if (!target && !update) {
			if ((roleState && !enable) || disable) {
				await msg.util.send(`${msg.author} awaiting confirmation to disable rolestate on \`${msg.guild.name}\`. All records for this guild will be removed. (y/n)`);
				const filter = m => m.author.id === msg.author.id && ['y', 'yes', 'n', 'no'].includes(m.content.toLowerCase());
				try {
					const collected = await msg.channel.awaitMessages(filter, { max: 1, time: 20000, errors: ['time'] });
					if (['yes', 'y'].includes(collected.first().content)) {
						await this.client.db.models.rolestates.destroy({ where: { guild: msg.guild.id } });
						this.client.guildSettings.set(msg.guild.id, 'roleState', false);

						return msg.util.send(`✓ Disabled rolestate on \`${msg.guild.name}\`.`);
					}
					throw new Error('Negative user input');
				} catch (err) {
					return msg.util.send(`✘ Action canceled${err.message === 'Negative user input' ? '' : ' (timeout)'}`);
				}
			}
			if (!botMember.hasPermission('MANAGE_ROLES') && !enable) {
				return msg.util.send(`${msg.author} I need the \`MANAGE_ROLES\` permission for rolestate to work properly.`);
			}

			if ((!roleState && !disable) || enable) {
				await msg.util.send(`${msg.author} awaiting confirmation to enable rolestate on \`${msg.guild.name}\`. This will make all of this guilds assigned roles persistent. I am only able to assign roles that are lower than my highest role. Roles that can not be assigned will be dropped from this persons rolestate should they rejoin. (y/n)`);
				const filter = m => m.author.id === msg.author.id && ['y', 'yes', 'n', 'no'].includes(m.content.toLowerCase());
				try {
					const collected = await msg.channel.awaitMessages(filter, { max: 1, time: 20000, errors: ['time'] });
					if (['yes', 'y'].includes(collected.first().content)) {
						const records = [];
						for (const member of members.values()) {
							for (const role of member.roles.filter(r => r.id !== msg.guild.id).values()) {
								records.push({
									role: role.id,
									guild: msg.guild.id,
									user: member.id
								});
							}
						}
						if (enable) {
							await this.client.db.models.rolestates.destroy({
								where: {
									guild: msg.guild.id
								}
							});
						}
						await this.client.db.models.rolestates.bulkCreate(records);
						this.client.guildSettings.set(msg.guild.id, 'roleState', true);

						return msg.util.send(`✓ Enabled rolestate on \`${msg.guild.name}\`.`);
					}
					throw new Error('Negative user input');
				} catch (err) {
					return msg.util.send(`✘ Action canceled${err.message === 'Negative user input' ? '' : ' (timeout)'}`);
				}
			}
		}
		if (!roleState) {
			return msg.util.send(`✘ Rolestate is not enabled on \`${msg.guild.name}\`. If you want to enable rolestate use \`${this.client.guildSettings.get(msg.guild.id, 'prefix', '?')}rolestate\` without additional arguments.`);
		}
		if (update) {
			await msg.util.send(`${msg.author} awaiting confirmation to update rolestate on \`${msg.guild.name}\`. This will update rolestate for users currently in the server and remove records for roles that no longer exist. (y/n)`);
			const filter = m => m.author.id === msg.author.id && ['y', 'yes', 'n', 'no'].includes(m.content.toLowerCase());
			try {
				const collected = await msg.channel.awaitMessages(filter, { max: 1, time: 20000, errors: ['time'] });
				if (['yes', 'y'].includes(collected.first().content)) {
					await this.client.db.models.rolestates.destroy({
						where: {
							guild: msg.guild.id,
							[Op.or]: [
								{
									user: {
										[Op.in]: members.keyArray()
									}
								},
								{
									role: {
										[Op.notIn]: msg.guild.roles.keyArray()
									}
								}
							]

						}
					});
					const records = [];
					for (const member of members.values()) {
						for (const role of member.roles.filter(r => r.id !== msg.guild.id).values()) {
							records.push({
								role: role.id,
								guild: msg.guild.id,
								user: member.id
							});
						}
					}
					await this.client.db.models.rolestates.bulkCreate(records);
					return msg.util.send(`✓ Updated rolestate for \`${msg.guild.name}\`.`);
				}
				throw new Error('Negative user input');
			} catch (err) {
				return msg.util.send(`✘ Action canceled${err.message === 'Negative user input' ? '' : ' (timeout)'}`);
			}
		}
		if (typeof target === 'string') {
			try {
				target = this.client.users.get(target) || await this.client.users.fetch(target);
			} catch (_) {
				return msg.util.send(`✘ Invalid user: \`${target}\``);
			}
		}
		const result = await this.client.db.models.rolestates.findAll({
			where: {
				guild: msg.guild.id,
				user: target.id
			}
		});
		const roleIDs = result.map(r => r.role).filter(r => msg.guild.roles.has(r));
		const assignableRoles = [];
		const unassignableRoles = [];
		for (const rID of roleIDs) {
			const role = msg.guild.roles.get(rID);
			const roleInfo = `\`${role.name}\` (${role.id})`;
			if (botMember.roles.highest.comparePositionTo(rID) <= 0) {
				unassignableRoles.push(roleInfo);
			} else {
				assignableRoles.push(roleInfo);
			}
		}
		if (target instanceof GuildMember) {
			target = target.user;
		}
		const embed = new DaydreamEmbed()
			.setThumbnail(target.displayAvatarURL())
			.addField(`${target.bot ? 'Bot' : 'User'} Information`, stripIndents`
					Profile: ${target}
					ID: ${target.id}
					Tag: \`${target.tag}\``, true);
		if (assignableRoles.length) {
			embed.addField(`Assignable roles [${assignableRoles.length}]`, assignableRoles.join('\n'), true);
		}
		if (unassignableRoles.length) {
			embed.addField(`Unassignable roles* [${unassignableRoles.length}]`, unassignableRoles.join('\n'), true)
				.setFooter('* Unassignable roles are of higher or equal position compared to the bots highest role, they will not be assigned and dropped from rolestate if this user (re)joins the server.');
		}
		if (!assignableRoles.length && !unassignableRoles.length) {
			embed.addField('Rolestate', 'No roles saved');
		}
		if (!embed.color && msg.guild.me.displayColor) {
			embed.setColor(msg.guild.me.displayColor);
		}
		msg.util.send('', embed.applySpacers().shorten());
	}
}
module.exports = RoleStateCommand;
