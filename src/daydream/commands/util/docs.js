const { Command } = require('discord-akairo');
const fetch = require('node-fetch');
const qs = require('query-string');

// command by iCrawl @https://github.com/Naval-Base/yukikaze

const sources = ['stable', 'master', 'rpc', 'commando', 'akairo', 'akairo-master', '11.5-dev'];
class DocsCommand extends Command {
	constructor() {
		super('docs', {
			aliases: ['docs', 'c', 'doc'],
			description: {
				content: 'Display Discord.js documentation for query',
				usage: '<query>'
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
					id: 'force',
					match: 'flag',
					flag: ['--force', '--f', '-f']
				}
			]
		});
	}

	async exec(msg, { query, force }) {
		query = query.split(' ');
		let source = sources.includes(query.slice(-1)[0]) ? query.pop() : 'stable';
		if (source === '11.5-dev') {
			source = `https://raw.githubusercontent.com/discordjs/discord.js/docs/11.5-dev.json`;
		}
		const queryString = qs.stringify({ src: source, q: query.join(' '), force });
		const res = await fetch(`https://djsdocs.sorta.moe/v2/embed?${queryString}`);
		const embed = await res.json();
		if (!embed) {
			return msg.util.reply('Could not find requested content.');
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
