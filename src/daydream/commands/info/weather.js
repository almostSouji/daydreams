const { Command } = require('discord-akairo');
const fetch = require('node-fetch');
const validLocationString = 'Locations: Any location in any language (`munich`), airports (`MUC`), sights (`~statue of liberty`), moon phases (`moon`, `moon@2019-03-25`), GPS coordinates (`-78.46,106.79`).';

class QuoteCommand extends Command {
	constructor() {
		super('weather', {
			aliases: ['weather', 'w', 'wttr'],
			description: {
				content: `Show weather in specified location (${validLocationString} (\`--language <la>\` to display output in specific language (defaul: en), \`--days <0 | 1 | 2>\` to show forecast (default 0), \`--unit <u | m>\` (u: USCS, m: metric, default: m))`,
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
					'type': ['en', 'af', 'da', 'de', 'fr', 'fa', 'et', 'id', 'it', 'nb', 'nl', 'pl', 'pt-br', 'ro', 'ru', 'uk', 'az', 'be', 'bg', 'bs', 'ca', 'cy', 'cs', 'el', 'eo', 'es', 'fi', 'hi', 'hr',
						'hu', 'hy', 'is', 'ja', 'jv', 'ka', 'kk', 'ko',
						'ky', 'lt', 'lv', 'mk', 'ml', 'nl', 'nn', 'pt',
						'pt-br', 'sk', 'sl', 'sr', 'sr-lat', 'sv', 'sw', 'th',
						'tr', 'te', 'uz', 'vi', 'zh', 'zu', 'he'],
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
			return msg.util.send(`Please specify a location to retrieve data from.\n${validLocationString}`);
		}
		const queryString = location.startsWith('~') ? location.replace(' ', '+') : location.replace(' ', '%20');
		const url = `http://wttr.in/${queryString}?TAnF${days}${unit}&lang=${language}`;
		try {
			const res = await fetch(url);
			if (res.status !== 200) {
				return msg.util.send(`No weather data for location \`${location}\` found.\n${validLocationString}`);
			}
			const txt = await res.text();
			if (txt.includes('Sorry, we are running out of queries to the weather service at the moment.')) {
				return msg.util.send(`No weather data for location \`${location}\` found.\n${validLocationString}`);
			}
			return msg.util.send(txt, { code: true });
		} catch (err) {
			this.client.logger.info(`Weather error: ${err.stack}`);
			return msg.util.send('Something went wrong.');
		}
	}
}

module.exports = QuoteCommand;
