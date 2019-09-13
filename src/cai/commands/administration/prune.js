const { Command, Argument } = require('discord-akairo');
const { Util } = require('../../../daydream');
const { Snowflake } = require('discord.js');


class PruneCommand extends Command {
	constructor() {
		super('prune', {
			aliases: ['prune', 'clean', 'clear'],
			description: {
				content: 'Clear messages, the amount is the amount of messages before applying filters (`--bots` to only delete bot messages, `--pins` to delete pins,  `--user user` to only clear messages by the specified user)',
				usage: '<amount to filter from> [--bots] [--user <id>] [--pins]'
			},
			clientPermissions: ['READ_MESSAGE_HISTORY', 'MANAGE_MESSAGES'],
			userPermissions: ['MANAGE_MESSAGES'],
			channel: 'guild',
			args: [
				{
					id: 'number',
					type: Argument.range('number', 1, 500, true)
				},
				{
					id: 'bots',
					match: 'flag',
					flag: ['--bots', '--botonly', '--b']
				},
				{
					id: 'pins',
					match: 'flag',
					flag: ['--pins', '--pin', '--p']
				},
				{
					id: 'user',
					match: 'option',
					flag: ['--user', '--u'],
					type: Argument.union('user', 'string')
				}
			]
		});
	}

	async exec(msg, { number, bots, pins, user }) {
		if (!number || isNaN(number)) {
			return msg.util.send(`✘ Provide the number of messages to prune`);
		}

		if (typeof user === 'string') {
			try {
				user = await this.client.users.fetch(user);
			} catch (err) {
				return msg.util.send(`✘ Invalid user: \`${user}\``);
			}
		}
		const pinnedMessages = (await msg.channel.messages.fetchPinned()).keyArray();

		let deleteString = '✓ Deleting messages';
		if (bots) {
			deleteString += ' by bots';
		}
		if (user) {
			deleteString += ` by \`${user.tag}\``;
		}
		if (pins) {
			deleteString += ' including pins';
		}
		const deleteMessage = await msg.util.send(`${deleteString}...`);
		const filtered = [];
		let fetchedAmount = 0;
		let last = '';
		while (fetchedAmount < number) {
			const fetch = number - fetchedAmount;
			const options = { limit: fetch >= 98 ? 100 : fetch + 2 };
			if (last) {
				options.before = last;
			}
			const messages = await msg.channel.messages.fetch(options);
			fetchedAmount += messages.size;
			for (const [_, m] of messages) {
				if (msg.id === m.id) continue;
				if (m.id === deleteMessage.id) continue;
				if (!pins && pinnedMessages.includes(m.id)) continue;
				if (bots && !m.author.bot) continue;
				if (user && m.author.id !== user.id) continue;
				filtered.push(m.id);
			}
			if (messages.last()) {
				last = messages.last().id;
			}
		}

		const willPrune = filtered.filter(id => Date.now() - Snowflake.deconstruct(id).date.getTime() < 1209600000).length;
		const chunks = Util.chunkArray(filtered, 100);
		for (const c of chunks) {
			await msg.channel.bulkDelete(c, true);
		}
		return msg.util.send(`✓ Deleted ${willPrune}/${number} scanned message${number > 1 ? 's' : ''}${bots ? ' (by bots)' : ''}${user ? ` (by \`${user.tag}\`)` : ''}${pins ? ' including pins' : ''}`);
	}
}
module.exports = PruneCommand;
