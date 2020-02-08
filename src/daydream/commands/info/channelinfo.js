const { Command, Argument } = require('discord-akairo');
const { stripIndents } = require('common-tags');
const { Channel } = require('discord.js');
const { DaydreamEmbed } = require('../../index');
const { format, formatDistanceStrict } = require('date-fns');
const { MESSAGES } = require('../../util/constants');

const { displayStatus, toTitleCase, groupBy } = require('../../util');
class ChannelInfoCommand extends Command {
	constructor() {
		super('channelinfo', {
			aliases: ['channelinfo', 'channel', 'cinfo'],
			description: {
				content: 'Display information about provided channel',
				usage: '[channel]'
			},
			editable: true,
			clientPermissions: ['EMBED_LINKS'],
			args: [
				{
					'id': 'channel',
					'type': Argument.union('channel', 'string'),
					'default': message => message.channel
				}
			]
		});
	}

	buildInfoEmbed(ref) {
		const embed = new DaydreamEmbed();
		let infoString = '';
		ref.type === 'dm'
			? infoString += `DM with \`${ref.recipient.tag}\``
			: infoString += `Name: \`${ref.name}\``;
		infoString += `\nID: ${ref.id}`;
		if (ref.type !== 'dm') {
			infoString += `\nType: ${ref.type}`;
		}
		if (ref.type === 'text') {
			infoString += `\nMention: ${ref}`;
		}
		infoString += `\nCreated: ${formatDistanceStrict(ref.createdAt, Date.now(), { addSuffix: true })} (${format(ref.createdAt, this.client.config.dateFormat)})`;
		embed.addField('Channel Information', infoString, true);

		if (ref.topic) {
			embed.addField('Channel Topic', `${ref.topic}`, false);
		}

		if (ref.type === 'voice') {
			let voiceString = `Bitrate: ${ref.bitrate / 1000} kbps`;
			if (ref.userLimit) {
				voiceString += `\nCapacity: \`${ref.members.size.toString().padStart(2, '0')}/${ref.userLimit.toString().padStart(2, '0')}\``;
			}

			embed.addField('Voice Information', voiceString, false);
		}

		if (ref.parentID) {
			embed.addField('Parent Information', stripIndents`
			Name: \`${ref.parent.name}\`
			Id: ${ref.parentID}
			Permissions synchronized: ${ref.permissionsLocked}
		`, false);
		}

		if (ref.members && ref.members.size) {
			embed.addField('Members', groupBy(ref.members, m => m.presence.status).map((s, k) => `${displayStatus(this.client, k, ref.guild)} ${s.size}`));
		}

		if (ref.type === 'dm') {
			embed.addField('Recipient Information', stripIndents`ID: ${ref.recipient.id}
					Profile: ${ref.recipient}
					Status: ${toTitleCase(ref.recipient.presence.status)}${displayStatus(this.client, ref.recipient.presence.status)}
					Created: ${formatDistanceStrict(ref.recipient.createdAt, Date.now(), { addSuffix: true })} (${format(ref.recipient.createdAt, this.client.config.dateFormat)})`);
		}
		if (!embed.color && ref.guild && ref.guild.me.displayColor) {
			embed.setColor(ref.guild.me.displayColor);
		}

		return embed;
	}

	exec(msg, { channel }) {
		if (channel instanceof Channel) {
			return msg.util.send('', this.buildInfoEmbed(channel));
		}
		return msg.util.send(MESSAGES.ERRORS.RESOLVE(channel, 'channel'));
	}
}

module.exports = ChannelInfoCommand;
