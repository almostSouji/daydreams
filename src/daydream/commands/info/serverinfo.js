const { Command } = require('discord-akairo');
const { stripIndents } = require('common-tags');
const { DaydreamEmbed } = require('../../index');
const { format, formatDistanceStrict } = require('date-fns');
const { displayStatus, toTitleCase, groupBy } = require('../../util');
const { Constants } = require('discord.js');
const { MESSAGES } = require('../../util/constants');

class ServerInfoCommand extends Command {
	constructor() {
		super('serverinfo', {
			aliases: ['serverinfo', 'guildinfo', 'server', 'guild', 'sinfo', 'ginfo'],
			description: {
				content: 'Display information about the server',
				usage: ''
			},
			editable: true,
			clientPermissions: ['EMBED_LINKS'],
			channel: 'guild'
		});
	}

	async buildInfoEmbed(ref) {
		const { members } = ref;
		const channelCounts = groupBy(ref.channels, c => c.type).map((v, k) => `${toTitleCase(k)} channels: ${v.size}`);
		const presenceCounts = groupBy(members, m => m.presence.status).map((s, k) => `${displayStatus(this.client, k, ref)} ${s.size}`);
		const memberCounts = groupBy(members, m => m.user.bot).map((v, k) => `${k ? 'Bots:' : 'Humans:'} ${v.size}`);
		const roleCount = `Roles: ${ref.roles.size}`;
		const embed = new DaydreamEmbed()
			.setThumbnail(ref.iconURL())
			.addField('Server Information', stripIndents`
			Name: \`${ref.name}\`
			ID: ${ref.id}
			Created: ${formatDistanceStrict(ref.createdAt, Date.now(), { addSuffix: true })} (${format(ref.createdAt, this.client.config.dateFormat)})
			Region: ${ref.region}
			Owner: \`${ref.owner.user.tag}\`
			Verification: ${Constants.verificationLevel[ref.verificationLevel]}
		`, true);

		embed.addField('Counts', channelCounts.concat(memberCounts, roleCount).join(`\n`), true);
		if (this.client.guildSettings.get(ref.id, 'roleState') && this.client.db.models.rolestates) {
			const result = await this.client.db.models.rolestates.findAll({
				where: {
					guild: ref.id
				}
			});
			const uRoles = new Set(result.map(r => r.role));
			const uUsers = new Set(result.map(r => r.user));
			embed.addField('Rolestate', MESSAGES.COMMANDS.GUILD_INFO.ROLESTATE(result.length, uRoles.size, uUsers.size));
		}
		embed.addField('Members', presenceCounts.join('\n'));

		if (!embed.color && ref.me.displayColor) {
			embed.setColor(ref.me.displayColor);
		}

		return embed.applySpacers();
	}

	async exec(msg) {
		await msg.guild.members.fetch();
		return msg.util.send('', await this.buildInfoEmbed(msg.guild));
	}
}

module.exports = ServerInfoCommand;

