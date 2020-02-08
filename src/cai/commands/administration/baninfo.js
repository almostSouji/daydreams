const { Command } = require('discord-akairo');
const { DaydreamEmbed } = require('../../../daydream');
const { stripIndents } = require('common-tags');
const { format, formatDistanceStrict } = require('date-fns');
const { MESSAGES } = require('../../util/constants');

class baninfoCommand extends Command {
	constructor() {
		super('baninfo', {
			aliases: ['baninfo', 'getban', 'fetchban', 'bans', 'binfo'],
			description: {
				content: 'Fetch ban info for provided user',
				usage: `<user>`
			},
			clientPermissions: ['BAN_MEMBERS', 'VIEW_AUDIT_LOG', 'EMBED_LINKS'],
			userPermissions: ['BAN_MEMBERS'],
			channel: 'guild',
			args: [
				{
					id: 'target',
					type: 'string'
				}
			]
		});
	}

	async buildInfoEmbed(ref, guild, banArray) {
		const auditLogs = await guild.fetchAuditLogs({ type: 'MEMBER_BAN_ADD', limit: 100 });
		const log = auditLogs.entries.find(val => val.target.id === ref.user.id);
		const embed = new DaydreamEmbed()
			.setThumbnail(ref.user.displayAvatarURL())
			.addField(`Ban ${banArray.findIndex(b => b.user.id === ref.user.id) + 1} of ${banArray.length}`, stripIndents`
					Profile: ${ref.user}
					Tag: \`${ref.user.tag}${ref.user.bot ? ' [BOT]' : ''}\`
					ID: ${ref.user.id}
					Created: ${formatDistanceStrict(ref.user.createdAt, Date.now(), { addSuffix: true })} (${format(ref.user.createdAt, this.client.config.dateFormat)})`, true);
		if (ref.reason) {
			embed.addField('Reason', ref.reason);
		}
		if (log) {
			embed.setFooter(`Executor: ${log.executor.tag}${log.executor.bot ? ' 🤖 ' : ''} (${log.executor.id})`, log.executor.displayAvatarURL())
				.setTimestamp(log.createdAt);
		}

		if (!embed.color) {
			embed.setColor(guild.me.displayColor);
		}

		return embed;
	}

	async exec(msg, { target }) {
		await msg.util.send(MESSAGES.COMMANDS.BAN_INFO.FETCHING);
		try {
			const banCollection = await msg.guild.fetchBans();
			const banArray = banCollection.array();
			if (!target) {
				return msg.util.send(MESSAGES.COMMANDS.BAN_INFO.ERRORS.NO_TARGET(banCollection.size));
			}
			const banObj = banCollection.find(val => val.user.id === target || val.user.tag === target);
			if (!banObj) {
				const targetNumber = parseInt(target, 10);
				if (isNaN(targetNumber) || targetNumber - 1 >= banCollection.size || targetNumber === 0) {
					return msg.util.send(MESSAGES.COMMANDS.BAN_INFO.ERRORS.QUERY(target, banCollection.size));
				}
				return msg.util.send(await this.buildInfoEmbed(banArray[targetNumber - 1], msg.guild, banArray));
			}
			return msg.util.send(await this.buildInfoEmbed(banObj, msg.guild, banArray));
		} catch (err) {
			this.client.logger.error(err);
			msg.util.send(MESSAGES.COMMANDS.BAN_INFO.ERRORS.CANCELED(err));
		}
	}
}
module.exports = baninfoCommand;
