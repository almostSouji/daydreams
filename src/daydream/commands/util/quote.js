const { Command, Argument } = require('discord-akairo');
const { GuildMember, Message } = require('discord.js');
const { DaydreamEmbed } = require('../../index');
const { format } = require('date-fns');
class QuoteCommand extends Command {
	constructor() {
		super('quote', {
			aliases: ['quote', 'q', 'cite'],
			description: {
				content: 'Quote provided message (`--color` to display with authors color, `--edits` to show edits (requires `MANAGE_MESSAGES` permission))',
				usage: '<messageID> [--color] [--edits]'
			},
			async before(m) {
				await m.util.send('Fetching...');
			},
			editable: true,
			clientPermissions: ['EMBED_LINKS'],
			channel: 'guild',
			args: [
				{
					id: 'qMsg',
					type: Argument.union('relevantMessage', 'string')
				},
				{
					id: 'color',
					match: 'flag',
					flag: ['--c', '--clr', '--color']
				},
				{
					id: 'edits',
					match: 'flag',
					flag: ['--e', '--changes', '--edits', '--show']
				}
			],
			cooldown: 10000,
			ratelimit: 1
		});
	}

	buildInfoEmbed(message, color, showedits) {
		const author = message.member || message.author;
		const embed = new DaydreamEmbed()
			.setTimestamp(message.createdAt);
		if (author instanceof GuildMember) {
			embed.setAuthor(`${author.displayName} ${author.user.bot ? '• Bot' : ''}`, author.user.displayAvatarURL());
			if (author.displayColor && (!embed.color || color)) {
				embed.setColor(author.displayColor);
			}
		} else {
			embed.setAuthor(message.webhookid ? `${author.username} • Webhook` : `${author.tag} ${author.bot ? '• Bot' : ''}`, author.displayAvatarURL());
		}
		if (message.channel.type === 'text') {
			embed.setFooter(`In #${message.channel.name}`);
		}
		if (message.edits.length && showedits) {
			for (const m of message.edits) {
				embed.addField(`Version ${format(m.editedAt || m.createdAt, 'yyyy/MM/dd/HH:mm:ss')} (UTC)`, m.content);
			}
		} else {
			embed.setDescription(`${message.content}\n[➜](${message.url} 'jump to message')`);
		}
		return embed.applySpacers().shorten();
	}

	exec(msg, { qMsg, color, edits }) {
		if (!qMsg) {
			return msg.util.send(`✘ No target provided, please provide a valid message ID.`);
		}
		if (qMsg instanceof Message) {
			if (qMsg.channel.type === 'text' && !qMsg.channel.permissionsFor(msg.author).has('VIEW_CHANNEL')) {
				return msg.util.send(`✘ You don't have permission to quote this message.`);
			}
			if (!qMsg.content) {
				return msg.util.send(`✘ The targeted message does not have any content to quote.`);
			}
			if (qMsg.channel.type === 'text' && !qMsg.channel.permissionsFor(msg.author).has('MANAGE_MESSAGES')) {
				edits = false;
			}
			return msg.util.send('', this.buildInfoEmbed(qMsg, color, edits));
		}
		return msg.util.send(`✘ Can not convert \`${qMsg}\` to \`message\``);
	}
}

module.exports = QuoteCommand;
