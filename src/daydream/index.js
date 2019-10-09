module.exports = {
	Client: require('./client/DaydreamClient'),
	DaydreamTextChannel: require('./extensions/TextChannel'),
	DaydreamGuild: require('./extensions/Guild'),
	DayDreamUser: require('./extensions/User'),
	DaydreamClient: require('./client/DaydreamClient'),
	Util: require('./util'),
	version: require('../../package.json').version,
	DaydreamEmbed: require('./structures/DaydreamEmbed'),
	Constants: require('./util/constants')
};
