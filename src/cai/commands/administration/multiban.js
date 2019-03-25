const { Command, Argument } = require('discord-akairo');
const { GuildMember, Collection } = require('discord.js');

class MultiBanCommand extends Command {
	constructor() {
		super('multiban', {
			aliases: ['multiban', 'mban', 'massban'],
			description: {
				content: 'Bans provided users (`--soft` to softban, `--prune` to remove messages, reason will be prompted)',
				usage: '<user...> [--soft] [--prune]'
			},
			clientPermissions: ['BAN_MEMBERS'],
			userPermissions: ['MANAGE_GUILD'],
			channel: 'guild',
			args: [
				{
					id: 'targets',
					type: Argument.union('member', 'string'),
					match: 'separate'
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

	async exec(msg, { targets, soft, prune }) {
		if (!targets) {
			return msg.util.send('✘ Provide at least one valid user to ban');
		}
		await msg.util.send('Making preparations, this might take a while...');
		const targetCollection = new Collection();
		let invalidInput = 0;
		let currentlyManaged = 0;
		let notManageable = 0;
		let alreadyBanned = 0;

		for (const value of targets) {
			let target = value;
			if (typeof value === 'string') {
				try {
					target = await msg.guild.members.fetch(value);
				} catch (_) {
					try {
						target = await this.client.users.fetch(value);
					} catch (_) { } // eslint-disable-line
				}
			}
			if (target && typeof target !== 'string') {
				targetCollection.set(target.id, target);
			} else {
				invalidInput++;
			}
		}
		const guildBans = await msg.guild.fetchBans();
		const validTargets = targetCollection.filter(target => {
			if (target instanceof GuildMember) {
				if (target.id === msg.member.id ||
					target.id === this.client.user.id ||
					!target.bannable ||
					(target.roles.highest.position >= msg.member.roles.highest.position && msg.member.id !== msg.guild.ownerID)
				) {
					notManageable++;
					return false;
				}
			}
			if (msg.guild.lockedUsers.has(target.id)) {
				currentlyManaged++;
				return false;
			}
			if (guildBans.has(target.id)) {
				alreadyBanned++;
				return false;
			}
			return true;
		});

		const invalidCount = notManageable + currentlyManaged + alreadyBanned + invalidInput;
		let invalidString = ` ${invalidCount} invalid ban target${invalidCount > 1 ? 's have' : ' has'} been filtered.`;
		if (notManageable) {
			invalidString += ` ${notManageable} ${notManageable > 1 ? 'are' : 'is'} not manageable by the bot or yourself.`;
		}
		if (currentlyManaged) {
			invalidString += ` ${currentlyManaged} ${currentlyManaged > 1 ? 'are' : 'is'} currently being managed.`;
		}
		if (alreadyBanned) {
			invalidString += ` ${alreadyBanned} ${alreadyBanned > 1 ? 'are' : 'is'} already banned.`;
		}
		if (invalidInput) {
			invalidString += ` ${invalidInput} argument${alreadyBanned > 1 ? 's' : ''} could not be resolved to ${alreadyBanned > 1 ? 'ban targets' : 'a ban target'}.`;
		}
		if (!validTargets.size) {
			return msg.util.send(`✘ Provide at least one valid user to ban.${invalidCount ? invalidString : ''}`);
		}
		for (const target of validTargets.values()) {
			msg.guild.lockedUsers.add(target.id);
		}
		await msg.util.send(`${msg.author} awaiting confirmation to ${soft ? 'soft' : ''}ban ${validTargets.map(t => `\`${t.tag || t.user.tag}\``).join(', ')}.${prune ? ' Their messages will be removed.' : ''}${invalidCount ? invalidString : ''} (y/n)`);
		const filter = m => m.author.id === msg.author.id && ['y', 'yes', 'n', 'no'].includes(m.content.toLowerCase());
		try {
			const collected = await msg.channel.awaitMessages(filter, { max: 1, time: 20000, errors: ['time'] });
			if (['yes', 'y'].includes(collected.first().content)) {
				await msg.util.send(`Provide a reason. Enter \`skip\` to provide none.`);
				const collectedReason = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, { max: 1, time: 20000, errors: ['time'] });
				const options = { days: prune ? 7 : null };
				const reason = collectedReason.first().content;
				if (reason !== 'skip') {
					options.reason = `by ${msg.author.tag} | ${msg.author.id} | ${reason ? reason : ''}`;
				}
				await msg.util.send('Working on it...');
				for (const target of validTargets.values()) {
					await msg.guild.members.ban(target, options);
					if (soft) {
						await msg.guild.members.unban(target, 'softban');
					}
					msg.util.send(`✓ ${soft ? 'Softb' : 'B'}anned ${validTargets.map(t => `\`${t.tag || t.user.tag}\``).join(', ')} on \`${msg.guild.name}\`${prune ? ' and removed their messages' : ''}${reason === 'skip' ? '' : ` with reason \`${reason}\``}.`);
				}
			} else {
				throw new Error('Negative user input');
			}
		} catch (err) {
			msg.util.send(`✘ Action canceled${err.message === 'Negative user input' ? '' : ' (timeout)'}`);
		}
		for (const target of validTargets.values()) {
			msg.guild.lockedUsers.delete(target.id);
		}
		return true;
	}
}
module.exports = MultiBanCommand;
