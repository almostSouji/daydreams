const { Command, Argument } = require('discord-akairo');
const { stripIndents } = require('common-tags');
const { DaydreamEmbed } = require('../../index');
const { format, formatDistanceStrict } = require('date-fns');
const { displayStatus, groupBy } = require('../../util');
const { Role } = require('discord.js');

class RoleInfoCommand extends Command {
	constructor() {
		super('roleinfo', {
			aliases: ['rinfo', 'role', 'roleinfo'],
			description: {
				content: 'Display information about the provided role (`--color` to display with role color)',
				usage: '<role> [--color]'
			},
			editable: true,
			clientPermissions: ['EMBED_LINKS'],
			channel: 'guild',
			args: [
				{
					id: 'role',
					type: Argument.union('role', 'string')
				},
				{
					id: 'color',
					match: 'flag',
					flag: ['--color', '--c']
				}
			]
		});
	}

	buildInfoEmbed(ref, color) {
		let infoString = stripIndents`
			Name: \`${ref.name}\`
			ID: ${ref.id}
			Mention: ${ref}
			Created: ${formatDistanceStrict(ref.createdAt, Date.now(), { addSuffix: true })} (${format(ref.createdAt, this.client.config.dateFormat)})`;
		if (ref.color) {
			infoString += `\nColor: ${ref.hexColor} (${ref.color})`;
		}
		const embed = new DaydreamEmbed()
			.addField('Role Information', infoString);

		if (ref.members.size) {
			embed.addField('Members', groupBy(ref.members, m => m.presence.status).map((s, k) => `${displayStatus(this.client, k, ref.guild)} ${s.size}`));
		}

		if (ref.color && (!embed.color || color)) {
			embed.setColor(ref.color);
		}
		return embed.applySpacers();
	}

	async exec(msg, { role, color }) {
		await msg.guild.members.fetch();
		if (!role) {
			return msg.util.send(`✘ No target provided, please provide a valid role.`);
		}
		if (role instanceof Role) {
			return msg.util.send('', this.buildInfoEmbed(role, color));
		}
		return msg.util.send(`✘ Can not convert \`${role}\` to \`role\``);
	}
}

module.exports = RoleInfoCommand;
