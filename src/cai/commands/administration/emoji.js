const { Command, Argument } = require('discord-akairo');
const { stripIndents } = require('common-tags');
const { GuildEmoji, Role } = require('discord.js');
const { DaydreamEmbed } = require('../../../daydream');
const { format, formatDistanceStrict } = require('date-fns');


class EmojiCommand extends Command {
	constructor() {
		super('emoji', {
			aliases: ['emoji', 'emojirestrict', 'emojis'],
			description: {
				content: 'Update emoji restrictions',
				usage: `<emoji> [clear|<role>]`
			},
			clientPermissions: ['EMBED_LINKS', 'MANAGE_EMOJIS'],
			userPermissions: ['ADMINISTRATOR'],
			channel: 'guild',
			args: [
				{
					id: 'emoji',
					type: Argument.union('emoji', 'string')
				},
				{
					id: 'subcommand',
					type: Argument.union('role', 'string')
				}
			]

		});
	}

	buildInfoEmbed(emoji) {
		const embed = new DaydreamEmbed()
			.setThumbnail(emoji.url)
			.addField('Emoji Information', stripIndents`
			ID: ${emoji.id}
			Name: ${emoji.name}
			Image: [link](${emoji.url})
			Created: ${formatDistanceStrict(emoji.createdAt, Date.now(), { addSuffix: true })} (${format(emoji.createdAt, this.client.config.dateFormat)})
		`);

		if (emoji.roles.size) {
			embed.addField('Restricted to Roles', emoji.roles.map(role => `\`${role.name}\``).join(', '));
		}
		if (!embed.color && emoji.guild.me.displayColor) {
			embed.setColor(emoji.guild.me.displayColor);
		}
		return embed.applySpacers();
	}

	async exec(msg, { emoji, subcommand }) {
		if (!emoji) {
			return msg.util.send(`✘ Provide an emoji`);
		}
		if (emoji instanceof GuildEmoji) {
			if (subcommand === 'clear') {
				emoji.roles.remove(emoji.roles.keyArray());
				return msg.util.send(`✓ Cleared restrictions for \`:${emoji.name}:\``);
			}
			if (subcommand instanceof Role) {
				if (emoji.roles.has(subcommand.id)) {
					await emoji.roles.remove(subcommand);
					return msg.util.send(`✓ Removed role \`${subcommand.name}\` to emojiwhitelist \`:${emoji.name}:\``);
				}
				await emoji.roles.add(subcommand);
				return msg.util.send(`✓ Added role \`${subcommand.name}\` to emojiwhitelist \`:${emoji.name}:\``);
			}
			return msg.util.send(this.buildInfoEmbed(emoji));
		}
		if (typeof emoji === 'string') {
			return msg.util.send('', `✘ Invalid emoji: \`${emoji}\``);
		}
	}
}

module.exports = EmojiCommand;
