const { Command, Argument } = require('discord-akairo');
const { GuildMember } = require('discord.js');

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
			return msg.util.send('✘ Provide a user to ban');
		}
		if (typeof target === 'string') {
			try {
				target = await msg.guild.members.fetch(target);
			} catch (_) {
				try {
					target = await this.client.users.fetch(target);
				} catch (_) { // eslint-disable-line
					return msg.util.send(`✘ Invalid user: \`${target}\``);
				}
			}
		}

		if (target instanceof GuildMember) {
			if (target.id === msg.member.id || target.id === this.client.user.id) return msg.util.send('✘ Can not execute command on self');
			if (!target.bannable) return msg.util.send('✘ Command execution denied');
			if ((target.roles.highest.position >= msg.member.roles.highest.position || target.id === msg.guild.ownerID) && msg.member.id !== msg.guild.ownerID) return msg.util.send('✘ Missing authorization');
		}

		if (msg.guild.lockedUsers.has(target.id)) {
			return msg.util.send(`✘ User \`${target.tag || target.user.tag}\` is currently being moderated`);
		}

		const options = { reason: `by ${msg.author.tag} | ${msg.author.id} | ${reason ? reason : ''}`, days: prune ? 7 : null };
		const guildBans = await msg.guild.fetchBans();
		if (guildBans.has(target.id)) {
			return msg.util.send(`✘ User \`${target.tag || target.user.tag}\` is already banned`);
		}

		msg.guild.lockedUsers.add(target.id);
		await msg.util.send(`${msg.author} awaiting confirmation to ${soft ? 'soft' : ''}ban \`${target.tag || target.user.tag}\` (y/n)`);
		const filter = m => m.author.id === msg.author.id && ['y', 'yes', 'n', 'no'].includes(m.content.toLowerCase());
		try {
			const collected = await msg.channel.awaitMessages(filter, { max: 1, time: 20000, errors: ['time'] });
			if (['yes', 'y'].includes(collected.first().content)) {
				const banned = await msg.guild.members.ban(target, options);
				if (soft) {
					msg.guild.members.unban(target, 'softban');
				}

				msg.guild.lockedUsers.delete(target.id);
				return msg.util.send(`✓ ${soft ? 'Softb' : 'B'}anned \`${banned.tag || banned.user.tag}\` on \`${msg.guild.name}\`${prune ? ' and removed their messages' : ''}${reason ? ` with reason \`${reason}\`` : ''}`, null, true);
			}
			throw new Error('Negative user input');
		} catch (err) {
			msg.guild.lockedUsers.delete(target.id);
			return msg.util.send(`✘ Action canceled${err.message === 'Negative user input' ? '' : ' (timeout)'}`);
		}
	}
}
module.exports = BanCommand;
