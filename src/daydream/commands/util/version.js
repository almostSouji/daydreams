const akairo = require('discord-akairo');
const { version: djsversion, Permissions } = require('discord.js');
const { stripIndents } = require('common-tags');
const { DaydreamEmbed } = require('../../index');
const { readFileSync } = require('fs');
const lockfile = require('@yarnpkg/lockfile');
const { version: daydreamsversion } = require('../../');
const { join } = require('path');

class VersionCommand extends akairo.Command {
	constructor() {
		super('version', {
			aliases: ['commit', 'v', 'ver', 'dep', 'dependencies', 'version'],
			editable: true,
			description: {
				content: 'Display project and depdency versions',
				usage: ''
			},
			clientPermissions: ['EMBED_LINKS']
		});
	}

	async buildInfoEmbed(discordJS, discordAkairo, msg) {
		const creator = await this.client.users.fetch('83886770768314368');
		const permissionArray = [...new Set(this.handler.modules.reduce((a, e) => a.concat(e.clientPermissions), []).filter(e => e))];
		const permissions = new Permissions(permissionArray);
		const hashReg = /(?:tar.gz\/|#)(\w+)/;
		const djsHash = discordJS.match(hashReg)[1];
		const akairoHash = discordAkairo.match(hashReg)[1];
		const embed = new DaydreamEmbed()
			.setThumbnail(this.client.user.displayAvatarURL())
			.addField(`Project: Daydreams: ${daydreamsversion}`,
				stripIndents`[view on GitHub](https://github.com/project-daydreams/daydreams) | [invite ${this.client.user.username}](https://discordapp.com/oauth2/authorize?client_id=${this.client.user.id}&permissions=${permissions.bitfield}&scope=bot)
				
				Maximum permissions needed in this version: ${permissionArray.map(perm => `\`${perm}\``).join(', ')}`)
			.addField(`Library: Discord.js: ${djsversion}`, stripIndents`Commithash: \`${djsHash}\`
					[view on GitHub](https://github.com/discordjs/discord.js/commit/${djsHash})`)
			.addField(`Framework: Akairo: ${akairo.version}`, stripIndents`Commithash: \`${akairoHash}\`
					[view on GitHub](https://github.com/1Computer1/discord-akairo/commit/${akairoHash})`)
			.setFooter(`Coded with 🍵 by ${creator.username} | running on Node.js ${process.version}`, creator.displayAvatarURL());

		if (!embed.color && msg.guild && msg.guild.me.displayColor) {
			embed.setColor(msg.guild.me.displayColor);
		}
		return embed;
	}

	async exec(msg) {
		try {
			const file = readFileSync(join(__dirname, '..', '..', '..', '..', 'yarn.lock'), 'utf8');
			const dependencies = lockfile.parse(file).object;
			const discordJS = dependencies['discord.js@discordjs/discord.js'];
			const discordAkairo = dependencies['discord-akairo@1Computer1/discord-akairo'];
			return msg.util.send(null, await this.buildInfoEmbed(discordJS.resolved, discordAkairo.resolved, msg));
		} catch (e) {
			const lock = require(join(__dirname, '..', '..', '..', '..', 'package-lock.json'), 'utf8');
			const discordJS = lock.dependencies['discord.js'].version;
			const discordAkairo = lock.dependencies['discord-akairo'].version;
			return msg.util.send(null, await this.buildInfoEmbed(discordJS, discordAkairo, msg));
		}
	}
}
module.exports = VersionCommand;
