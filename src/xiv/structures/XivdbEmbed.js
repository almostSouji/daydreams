const { DaydreamEmbed } = require('../../daydream');
const { fromUnixTime } = require('date-fns');

class XivdbEmbed extends DaydreamEmbed {
	constructor(timestamp, data = {}) {
		super(data);
		this.footer = {
			text: `Powered by xivapi.com | Data from`,
			icon_url: 'https://xivapi.com/favicon.png'
		};
		this.timestamp = fromUnixTime(timestamp);
	}
}

module.exports = XivdbEmbed;
