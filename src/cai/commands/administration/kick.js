const { Command, Argument } = require('discord-akairo');
const { GuildMember } = require('discord.js');
const { DAYDREAM, MESSAGES } = require('../../util/constants');

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
			return msg.channel.send(DAYDREAM.ERRORS.TARGET('user'));
		}
		if (typeof target === 'string') {
			try {
				target = msg.guild.member(target) || await msg.guild.members.fetch(target);
			} catch (_) {
				return msg.util.send(DAYDREAM.ERRORS.RESOLVE(target, 'user'));
			}
		}

		if (target instanceof GuildMember) {
			if (target.id === msg.member.id || target.id === this.client.user.id) return msg.util.send(MESSAGES.COMMANDS.KICK.ERROS.SELF);
			if (!target.kickable) return msg.util.send(MESSAGES.COMMANDS.KICK.ERROS.NOT_BANNABLE);
			if ((target.roles.highest.position >= msg.member.roles.highest.position || target.id === msg.guild.ownerID) && msg.member.id !== msg.guild.ownerID) return msg.util.send(MESSAGES.COMMANDS.KICK.ERROS.HIGHER_TARGET);
		}

		if (msg.guild.lockedUsers.has(target.id)) {
			return msg.util.send(MESSAGES.COMMANDS.KICK.ERROS.MODERATED);
		}

		msg.guild.lockedUsers.add(target.id);
		await msg.util.send(MESSAGES.COMMANDS.KICK.PROMPT(msg.author, target.user.tag));
		const filter = m => m.author.id === msg.author.id && DAYDREAM.PROMPT_ANSWERS_ALL.includes(m.content.toLowerCase());

		try {
			const collected = await msg.channel.awaitMessages(filter, { max: 1, time: 20000, errors: ['time'] });
			if (DAYDREAM.PROMPT_ANSWERS.GRANTED.includes(collected.first().content)) {
				const kicked = await target.kick(MESSAGES.COMMANDS.KICK.REASON(msg.author, reason ? reason : ''));

				msg.guild.lockedUsers.delete(target.id);
				return msg.util.send(MESSAGES.COMMANDS.KICK.SUCCESS(kicked.user.tag, msg.guild.name, reason), null, true);
			}
			throw new Error('Negative user input');
		} catch (err) {
			msg.guild.lockedUsers.delete(target.id);
			return msg.util.send(MESSAGES.COMMANDS.KICK.ERROS.CANCELED(err.message === 'Negative user input'));
		}
	}
}
module.exports = KickCommand;
