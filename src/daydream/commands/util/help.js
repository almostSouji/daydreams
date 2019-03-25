const { Command } = require('discord-akairo');
const { stripIndents } = require('common-tags');
const { toTitleCase } = require('../../util');
const { DaydreamEmbed } = require('../../index');

class HelpCommand extends Command {
	constructor() {
		super('help', {
			aliases: ['help', 'h', 'commandinfo'],
			description: {
				content: 'Display Command help (`--all` to show all commands, regardless of permissions)',
				usage: '[command] [--all]'
			},
			clientPermissions: ['EMBED_LINKS'],
			editable: true,
			cooldown: 5000,
			ratelimit: 2,
			args: [
				{
					id: 'cmd',
					type: 'commandAlias'
				},
				{
					id: 'all',
					match: 'flag',
					flag: ['--all', '--a']
				}
			]
		});
	}

	buildInfoEmbed(ref, message) {
		let idString = `Name: \`${ref.id}\``;
		if (ref.category) {
			idString += `\nCategory: \`${ref.category}\``;
		}
		if (ref.aliases.length) {
			idString += `\nAliases: ${ref.aliases.map(e => `\`${e}\``).join(', ')}`;
		}

		let infoString = '';
		if (ref.description.content) {
			infoString += `\nDescription: ${ref.description.content}`;
		}
		if (ref.description.usage) {
			infoString += `\nUsage: \`${ref.description.usage}\``;
		}

		let restrictionString = '';
		if (ref.ownerOnly) {
			const check = this.client.isOwner(message.author);
			restrictionString += `\n${check ? '`✅`' : '`❌`'} Owner only`;
		}
		if (ref.channel === 'guild') {
			const check = message.channel.type === 'text';
			restrictionString += `\n${check ? '`✅`' : '`❌`'} Command can only be used in a guild`;
		}
		if (ref.userPermissions) {
			const check = message.channel.type === 'text' && message.member.permissions.has(ref.userPermissions);
			restrictionString += `\n${check ? '`✅`' : '`❌`'} User permissions: ${ref.userPermissions.map(e => `\`${e}\``).join(', ')}`;
		}
		if (ref.clientPermissions) {
			const check = message.channel.type === 'text' && message.guild.me.permissions.has(ref.clientPermissions);
			restrictionString += `\n${check ? '`✅`' : '`❌`'} Bot permissions: ${ref.clientPermissions.map(e => `\`${e}\``).join(', ')}`;
		}
		const embed = new DaydreamEmbed()
			.addField('Command Information', idString)
			.addField('About', infoString);
		if (restrictionString) {
			embed.addField('Restrictions', restrictionString);
		}
		if (!embed.color && message.guild && message.guild.me.displayColor) {
			embed.setColor(message.guild.me.displayColor);
		}
		return embed.applySpacers();
	}

	exec(msg, { cmd, all }) {
		if (!cmd) {
			const allowedCategories = this.handler.categories.filter(category => {
				const filtered = category.filter(comm => {
					if (all) {
						return true;
					}
					if (msg.channel.type === 'text' && comm.userPermissions) {
						return msg.member.hasPermission(comm.userPermissions);
					}
					if (comm.ownerOnly) {
						return this.client.isOwner(msg.author);
					}
					return true;
				});
				if (filtered.size) {
					return true;
				}
				return false;
			});
			const map = allowedCategories.map(cat => `${toTitleCase(cat.id)}: ${cat.filter(e => {
				if (all) {
					return true;
				}
				if (msg.channel.type === 'text' && e.userPermissions) {
					return msg.member.hasPermission(e.userPermissions);
				}
				return true;
			}).map(e => `\`${e.id}\``).join(', ')}`);
			return msg.util.send(stripIndents`
				Your available commands are:
				${map.join('\n')}

				You can use \`${this.handler.prefix(msg)}${this.id} <commandname>\` to get more information about a command.
			`);
		}
		msg.util.send('', this.buildInfoEmbed(cmd, msg));
	}
}
module.exports = HelpCommand;
