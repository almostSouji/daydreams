const { Command } = require('discord-akairo');
const { DaydreamEmbed } = require('../../../daydream');
const { stripIndents } = require('common-tags');

async function buildInfoEmbed(sandboxes) {
	const sandboxList = [];
	for (const s of sandboxes.values()) {
		const invites = await s.fetchInvites();
		let invite;
		if (invites.size) {
			invite = invites.first();
		} else {
			const channel = s.channels.find(c => c.type === 'text');
			invite = await channel.createInvite({ maxAge: 0 });
		}
		sandboxList.push(` \`${s.name} \` | ${invite}`);
	}
	const embed = new DaydreamEmbed()
		.setTitle(`Active sandboxes (${sandboxes.size})`)
		.setDescription(sandboxList.join('\n'));
	return embed;
}

class SandboxSeachCommand extends Command {
	constructor() {
		super('search', {
			aliases: ['search', 'find', 'info', 'list'],
			description: {
				content: 'Search for sandbox (display sandbox list if no arguments are provided)',
				usage: '[number]'
			},
			args: [
				{
					id: 'guild',
					type: 'string'
				}
			]
		});
	}

	async exec(msg, { guild }) {
		const { sandboxes, guilds } = this.client;
		await msg.util.send(`Retrieving data...`);
		guild = guilds.find(val => val.name === `Sandbox ${guild}`);
		if (!guild) {
			if (!sandboxes.size) {
				return msg.util.send('Amount of test stages: 0');
			}
			return msg.util.send(await buildInfoEmbed(sandboxes));
		}
		const invites = await guild.fetchInvites();
		let invite;

		if (invites.size) {
			invite = invites.first();
		} else {
			const channel = guild.channels.find(c => c.type === 'text');
			invite = await channel.createInvite({ maxAge: 0 });
		}

		const embed = new DaydreamEmbed()
			.setThumbnail(guild.iconURL())
			.addField(`Sandbox ${guild.sandbox} Information`, stripIndents`
				ID: ${guild.id}
				Owner: \`${this.client.users.get(guild.ownerID).tag}\`
				Invite: ${invite}
			`);

		return msg.util.send(embed);
	}
}
module.exports = SandboxSeachCommand;
