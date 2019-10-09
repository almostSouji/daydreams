const { Command } = require('discord-akairo');
const fetch = require('node-fetch');
const qs = require('query-string');
const { MESSAGES, DOCS } = require('../../util/constants');

// command by iCrawl @https://github.com/Naval-Base/yukikaze

class DocsCommand extends Command {
	constructor() {
		super('docs', {
			aliases: ['docs', 'c', 'doc'],
			description: {
				content: 'Display Discord.js documentation for query, (`--private` to show private properties in lists)',
				usage: '<query> [--private]'
			},
			clientPermissions: ['EMBED_LINKS'],
			editable: true,
			cooldown: 2000,
			ratelimit: 2,
			args: [
				{
					id: 'query',
					match: 'rest',
					type: 'lowercase'
				},
				{
					id: 'includePrivate',
					match: 'flag',
					flag: ['--private', '--p', '-p']
				},
				{
					id: 'force',
					match: 'flag',
					flag: ['--force', '--f', '-f']
				}
			]
		});
	}

	async exec(msg, { query, includePrivate, force }) {
		query = query.split(' ');
		let source = DOCS.API.SOURCES.includes(query.slice(-1)[0]) ? query.pop() : 'stable';
		if (source === DOCS.DEV_VERSION) {
			source = DOCS.DEV_SOURCE;
		}
		const queryString = qs.stringify({ src: source, q: query.join(' '), force, includePrivate });
		const res = await fetch(`${DOCS.API.BASE_URL}${queryString}`);
		const embed = await res.json();
		if (!embed) {
			return msg.util.reply(MESSAGES.DOCS.ERRORS.NOT_FOUND);
		}

		if (msg.channel.type === 'dm' || !msg.channel.permissionsFor(msg.guild.me).has(['ADD_REACTIONS', 'MANAGE_MESSAGES'], false)) {
			return msg.util.send({ embed });
		}
		const m = await msg.util.send({ embed });
		m.react('🗑');
		let react;
		try {
			react = await m.awaitReactions(
				(reaction, user) => reaction.emoji.name === '🗑' && user.id === msg.author.id,
				{ max: 1, time: 10000, errors: ['time'] }
			);
			react.first().message.delete();
		} catch (error) {
			m.reactions.removeAll();
			return m;
		}

		return m;
	}
}
module.exports = DocsCommand;
