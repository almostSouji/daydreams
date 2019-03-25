const { Command } = require('discord-akairo');

class UnbanCommand extends Command {
	constructor() {
		super('unban', {
			aliases: ['unban', 'uban'],
			description: {
				content: 'Unbans provided user',
				usage: '<user> [reason]'
			},
			clientPermissions: ['BAN_MEMBERS'],
			userPermissions: ['BAN_MEMBERS'],
			channel: 'guild',
			args: [
				{
					id: 'query',
					type: 'string',
					index: 0
				},
				{
					id: 'reason',
					match: 'rest',
					type: 'string',
					index: 1
				}
			]
		});
	}

	async exec(msg, { query, reason }) {
		if (!query) {
			return msg.util.send('✘ Provide a tag or userid to unban.');
		}
		const banCollection = await msg.guild.fetchBans();
		const banObj = banCollection.find(val => val.user.id === query || val.user.tag === query);
		if (!banObj) {
			return msg.util.send(`✘ Can not find a ban for \`${query}\``);
		}
		await msg.util.send(`${msg.author} awaiting confirmation to unban \`${banObj.user.tag}\`? (y/n)`);
		const filter = m => m.author.id === msg.author.id && ['y', 'yes', 'n', 'no'].includes(m.content.toLowerCase());
		try {
			const collected = await msg.channel.awaitMessages(filter, { max: 1, time: 20000, errors: ['time'] });
			if (['yes', 'y'].includes(collected.first().content)) {
				const unbannedUser = await msg.guild.members.unban(banObj.user, `by ${msg.author.tag} | ${msg.author.id} | ${reason ? reason : ''}`);

				return msg.util.send(`✓ Unbanned \`${unbannedUser.tag}\` ${reason ? ` with reason \`${reason}\`` : ''}`, null, true);
			}
			throw new Error('Negative user input');
		} catch (err) {
			return msg.util.send(`✘ Action canceled${err.message === 'Negative user input' ? '' : ' (timeout)'}.`);
		}
	}
}
module.exports = UnbanCommand;
