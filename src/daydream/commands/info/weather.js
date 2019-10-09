const { Command } = require('discord-akairo');
const fetch = require('node-fetch');
const { MESSAGES, WEATHER } = require('../../util/constants');

class QuoteCommand extends Command {
	constructor() {
		super('weather', {
			aliases: ['weather', 'w', 'wttr'],
			description: {
				content: `Show weather in specified location (${WEATHER.LOCATION_EXAMPLE} (\`--language <la>\` to display output in specific language (defaul: en), \`--days <0 | 1 | 2>\` to show forecast (default 0), \`--unit <u | m>\` (u: USCS, m: metric, default: m))`,
				usage: '<location> [--language <la>] [--days <0|1|2>] [--unit <m|u>]'
			},
			editable: true,
			clientPermissions: ['EMBED_LINKS'],
			channel: 'guild',
			args: [
				{
					id: 'location',
					match: 'text'
				},
				{
					'id': 'language',
					'match': 'option',
					'flag': ['--language', '--lang', '--l'],
					'type': WEATHER.LANGUAGES,
					'default': 'en'
				},
				{
					'id': 'unit',
					'match': 'option',
					'flag': ['--unit', '--u', '--unit'],
					'type': ['u', 'm'],
					'default': 'm'
				},
				{
					'id': 'days',
					'match': 'option',
					'flag': ['----days', '--d', '--foreca', '--forecast', '--fore'],
					'type': 'number',
					'default': 0
				}
			],
			cooldown: 10000,
			ratelimit: 1
		});
	}

	async exec(msg, { location, language, unit, days }) {
		if (days > 2) {
			days = 2;
		}
		if (days < 0) {
			days = 0;
		}
		if (!location) {
			return msg.util.send(MESSAGES.COMMANDS.WEATHER.ERRORS.MISSING_LOCATION);
		}
		const queryString = location.startsWith('~') ? location.replace(' ', '+') : location.replace(' ', '%20');
		const url = `http://wttr.in/${queryString}?TAnF${days}${unit}&lang=${language}`;
		try {
			const res = await fetch(url);
			if (res.status !== 200) {
				return msg.util.send(MESSAGES.COMMANDS.WEATHER.ERRORS.NO_DATA);
			}
			const txt = await res.text();
			if (txt.includes('Sorry, we are running out of queries to the weather service at the moment.')) {
				return msg.util.send(MESSAGES.COMMANDS.WEATHER.ERRORS.QUERIES);
			}
			return msg.util.send(txt, { code: true });
		} catch (err) {
			this.client.logger.info(MESSAGES.COMMANDS.WEATHER.LOGGER(err));
			return msg.util.send(MESSAGES.LOGGER('[WEATHER ERROR]', err.stack));
		}
	}
}

module.exports = QuoteCommand;
