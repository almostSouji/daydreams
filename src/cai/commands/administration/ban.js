const { Command, Argument } = require('discord-akairo');
const { GuildMember } = require('discord.js');
const { DAYDREAM, MESSAGES } = require('../../util/constants');

class BanCommand extends Command {
	constructor() {
		super('ban', {
			aliases: ['ban'],
			description: {
				content: 'Bans provided user (`--soft` to softban, `--prune` to remove messages)',
				usage: '<user> [--soft] [--prune] [reason]'
			},
			clientPermissions: ['BAN_MEMBERS'],
			userPermissions: ['BAN_MEMBERS'],
			channel: 'guild',
			args: [
				{
					id: 'target',
					type: Argument.union('member', 'string')
				},
				{
					id: 'soft',
					match: 'flag',
					flag: ['--soft', '--gentle', '-s']
				},
				{
					id: 'prune',
					match: 'flag',
					flag: ['--prune', '--del', '--delete', '--p']
				},
				{
					id: 'reason',
					match: 'rest'
				}
			]
		});
	}

	async exec(msg, { target, soft, prune, reason }) {
		if (!target) {
			return msg.util.send(DAYDREAM.ERRORS.TARGET('user to ban'));
		}
		if (typeof target === 'string') {
			try {
				target = await msg.guild.members.fetch(target);
			} catch (_) {
				try {
					target = await this.client.users.fetch(target);
				} catch (_) { // eslint-disable-line
					return msg.util.send(DAYDREAM.ERRORS.RESOLVE(target, 'user'));
				}
			}
		}

		if (target instanceof GuildMember) {
			if (target.id === msg.member.id || target.id === this.client.user.id) {
				return msg.util.send(MESSAGES.COMMANDS.BAN.ERRORS.SELF);
			}
			if (!target.bannable) {
				return msg.util.send(MESSAGES.COMMANDS.BAN.ERRORS.NOT_BANNABLE);
			}
			if ((target.roles.highest.position >= msg.member.roles.highest.position || target.id === msg.guild.ownerID) && msg.member.id !== msg.guild.ownerID) {
				return msg.util.send(MESSAGES.COMMANDS.BAN.ERRORS.HIGHER_TARGET);
			}
		}

		if (msg.guild.lockedUsers.has(target.id)) {
			return msg.util.send(MESSAGES.COMMANDS.BAN.ERRORS.MODERATED(target.tag || target.user.tag));
		}

		const options = { reason: MESSAGES.COMMANDS.BAN.REASON(msg.author, reason), days: prune && 7 };
		const guildBans = await msg.guild.fetchBans();
		if (guildBans.has(target.id)) {
			return msg.util.send(MESSAGES.COMMANDS.BAN.ERRORS.ALREADY_BANNED(target.tag || target.user.tag));
		}

		msg.guild.lockedUsers.add(target.id);
		await msg.util.send(MESSAGES.COMMANDS.BAN.PROMPT(msg.author, soft, target.tag || target.user.tag));
		const filter = m => m.author.id === msg.author.id && ['y', 'yes', 'n', 'no'].includes(m.content.toLowerCase());
		try {
			const collected = await msg.channel.awaitMessages(filter, { max: 1, time: 20000, errors: ['time'] });
			if (['yes', 'y'].includes(collected.first().content)) {
				const banned = await msg.guild.members.ban(target, options);
				if (soft) {
					msg.guild.members.unban(target, 'softban');
				}

				msg.guild.lockedUsers.delete(target.id);
				if (soft) {
					return msg.util.send(MESSAGES.COMMANDS.BAN.SUCCESS.SOFT_BANNED(banned.tag || banned.user.tag, msg.guild.name, reason, prune), null);
				}
				return msg.util.send(MESSAGES.COMMANDS.BAN.SUCCESS.SOFT_BANNED(banned.tag || banned.user.tag, msg.guild.name, reason, prune), null);
			}
			throw new Error('Negative user input');
		} catch (err) {
			msg.guild.lockedUsers.delete(target.id);
			return msg.util.send(MESSAGES.COMMANDS.BAN.ERRORS.CANCELED(err.message !== 'Negative user input'));
		}
	}
}
module.exports = BanCommand;
