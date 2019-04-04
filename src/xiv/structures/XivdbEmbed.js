const { DaydreamEmbed } = require('../../daydream');

class XivdbEmbed extends DaydreamEmbed {
	constructor(timestamp, data = {}) {
		super(data);
		this.footer = {
			text: 'Powered by XIVAPI.com',
			icon_url: 'https://xivapi.com/favicon.png'
		};
	}
}

module.exports = XivdbEmbed;
