const { Command, Argument } = require('discord-akairo');
const { stripIndents } = require('common-tags');
const { format } = require('date-fns');
const { User } = require('discord.js');
const { Util } = require('../../../daydream');


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

		const filtered = [];
		let alreadyfetched = 0;
		let fetching = true;
		let last = '';
		while (filtered.length < number && fetching) {
			const fetch = number - filtered.length;
			const options = { limit: fetch > 100 ? 100 : fetch };
			if (last) {
				options.before = last;
			}
			const messages = await msg.channel.messages.fetch(options);
			alreadyfetched += messages.size;
			for (const m of messages.values()) {
				if (msg.id === m.id) continue;
				if (!pins && pinnedMessages.includes(m.id)) continue;
				if (bots && !m.author.bot) continue;
				if (user && m.author.id !== user.id) continue;
				filtered.push(m.id);
			}
			if (messages.last()) {
				last = messages.last().id;
			}
			if (alreadyfetched >= number || !messages.size || number <= 100) {
				fetching = false;
			}
		}
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
		await msg.util.send(`${deleteString}...`);
		const chunks = Util.chunkArray(filtered, 100);
		let pruned = 0;
		for (const c of chunks) {
			console.log(c);
			pruned += (await msg.channel.bulkDelete(c, true)).size;
		}
		return msg.util.send(`✓ Deleted ${pruned}/${number} message${number > 1 ? 's' : ''}${bots ? ' by bots' : ''}${user ? ` by \`${user.tag}\`` : ''}${pins ? ' including pins' : ''}`);
	}
}
module.exports = PruneCommand;
