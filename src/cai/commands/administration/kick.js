const { Command, Argument } = require('discord-akairo');
const { GuildMember } = require('discord.js');

class KickCommand extends Command {
	constructor() {
		super('kick', {
			aliases: ['kick'],
			description: {
				content: 'Kicks provided member',
				usage: '<user> [reason]'
			},
			clientPermissions: ['KICK_MEMBERS'],
			userPermissions: ['KICK_MEMBERS'],
			channel: 'guild',
			args: [
				{
					id: 'target',
					type: Argument.union('member', 'string')
				},
				{
					id: 'reason',
					match: 'rest'
				}
			]
		});
	}

	async exec(msg, { target, reason }) {
		if (!target) {
			return msg.channel.send('✘ Provide a user to kick');
		}
		if (typeof target === 'string') {
			try {
				target = msg.guild.member(target) || await msg.guild.members.fetch(target);
			} catch (_) {
				return msg.util.send(`✘ Invalid user: \`${target}\``);
			}
		}

		if (target instanceof GuildMember) {
			if (target.id === msg.member.id || target.id === this.client.user.id) return msg.util.send('✘ Can not execute command on self');
			if (!target.kickable) return msg.util.send('✘ Command execution denied');
			if ((target.roles.highest.position >= msg.member.roles.highest.position || target.id === msg.guild.ownerID) && msg.member.id !== msg.guild.ownerID) return msg.util.send('✘ Missing authorization');
		}

		if (msg.guild.lockedUsers.has(target.id)) {
			return msg.util.send(`✘ User \`${target.tag || target.user.tag}\` is currently being moderated`);
		}

		msg.guild.lockedUsers.add(target.id);
		await msg.util.send(`${msg.author} awaiting confirmation to kick \`${target.user.tag}\` (y/n)`);
		const filter = m => m.author.id === msg.author.id && ['y', 'yes', 'n', 'no'].includes(m.content.toLowerCase());
		try {
			const collected = await msg.channel.awaitMessages(filter, { max: 1, time: 20000, errors: ['time'] });
			if (['yes', 'y'].includes(collected.first().content)) {
				const kicked = await target.kick(`by ${msg.author.tag} | ${msg.author.id} | ${reason ? reason : ''}`);

				msg.guild.lockedUsers.delete(target.id);
				return msg.util.send(`✓ Kicked \`${kicked.user.tag}\` from \`${msg.guild.name}\`${reason ? ` with reason \`${reason}\`` : ''}`, null, true);
			}
			throw new Error('Negative user input');
		} catch (err) {
			msg.guild.lockedUsers.delete(target.id);
			return msg.util.send(`✘ Action canceled${err.message === 'Negative user input' ? '' : ' (timeout)'}.`);
		}
	}
}
module.exports = KickCommand;
