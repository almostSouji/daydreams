require('dotenv').config();
const XivClient = require('./client/XivClient');

const client = new XivClient({
	owner: process.env.OWNERS.split(','),
	token: process.env.TOKEN,
	xivkey: process.env.XIV_KEY,
	prefix: process.env.PREFIX,
	dateFormat: process.env.DATE_FORMAT.replace(/_/g, ' '),
	hubGuild: process.env.HUB_GUILD,
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
		defaultEmbed: parseInt(process.env.EMBED_DEFAULT_COLOR, 10),
		logDelete: parseInt(process.env.EMBED_DELETE_COLOR, 10),
		logEdit: parseInt(process.env.EMBED_EDIT_COLOR, 10)
	}
});

client
	.on('error', err => client.logger.error(`Error:\n${err.stack}`))
	.on('warn', warn => client.logger.warn(`Warning:\n${warn}`));

process
	.on('error', err => client.logger.error(`Unhandled Promise rejection:\n${err.stack}`));

client.init();
client.start();
