require('dotenv').config();
const CelClient = require('./client/CelClient');

const client = new CelClient({
	owner: process.env.OWNERS.split(','),
	token: process.env.TOKEN,
	prefix: process.env.PREFIX,
	dateFormat: process.env.DATE_FORMAT.replace(/_/g, ' '),
	hubGuild: process.env.HUB_GUILD,
	icons: {
		online: process.env.ICON_ONLINE,
		idle: process.env.ICON_IDLE,
		dnd: process.env.ICON_DND,
		offline: process.env.ICON_OFFLINE

	},
	emojis: {
		online: process.env.EMOJI_ONLINE,
		offline: process.env.EMOJI_OFFLINE,
		invisible: process.env.EMOJI_OFFLINE,
		idle: process.env.EMOJI_IDLE,
		dnd: process.env.EMOJI_DND,
		streaming: process.env.EMOJI_STREAMING,
		crest: process.env.EMOJI_CREST
	},
	colors: {
		defaultEmbed: parseInt(process.env.EMBED_DEFAULT_COLOR, 10)
	}
});

client
	.on('error', err => client.logger.error(`Error:\n${err.stack}`))
	.on('warn', warn => client.logger.warn(`Warning:\n${warn}`));

client.init();
client.start();
