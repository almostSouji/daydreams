const akairo = require('discord-akairo');
const djs = require('discord.js');
const { stripIndents } = require('common-tags');
const { DaydreamEmbed } = require('../../index');
const { readFileSync } = require('fs');
const lockfile = require('@yarnpkg/lockfile');

class VersionCommand extends akairo.Command {
	constructor() {
		super('version', {
			aliases: ['commit', 'v', 'ver', 'dep', 'dependencies', 'version'],
			editable: true,
			clientPermissions: ['EMBED_LINKS']
		});
	}

	buildInfoEmbed(discordJS, discordAkairo, msg) {
		const hashReg = /(?:tar.gz\/|#)(\w+)/;
		const djsHash = discordJS.match(hashReg)[1];
		const akairoHash = discordAkairo.match(hashReg)[1];
		const embed = new DaydreamEmbed()
			.setThumbnail(this.client.user.displayAvatarURL())
			.addField(`Library: Discord.js: ${djs.version}`, stripIndents`Commithash: \`${djsHash}\`
					[view on GitHub](https://github.com/discordjs/discord.js/commit/${djsHash})`)
			.addField(`Framework: Akairo: ${akairo.version}`, stripIndents`Commithash: \`${akairoHash}\`
					[view on GitHub](https://github.com/1Computer1/discord-akairo/commit/${akairoHash})`)
			.setFooter(`Node.js ${process.version}`);

		if (!embed.color && msg.guild && msg.guild.me.displayColor) {
			embed.setColor(msg.guild.me.displayColor);
		}
		return embed.applySpacers();
	}

	exec(msg) {
		try {
			const file = readFileSync('../../yarn.lock', 'utf8');
			const dependencies = lockfile.parse(file).object;
			const discordJS = dependencies['discord.js@discordjs/discord.js'];
			const discordAkairo = dependencies['discord-akairo@1Computer1/discord-akairo'];
			return msg.util.send('', this.buildInfoEmbed(discordJS.resolved, discordAkairo.resolved, msg));
		} catch (e) {
			const lock = require('../../package-lock.json');
			const discordJS = lock.dependencies['discord.js'].version;
			const discordAkairo = lock.dependencies['discord-akairo'].version;
			return msg.util.send('', this.buildInfoEmbed(discordJS, discordAkairo, msg));
		}
	}
}
module.exports = VersionCommand;
