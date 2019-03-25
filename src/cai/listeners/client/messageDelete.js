const { Listener } = require('discord-akairo');
const { stripIndents } = require('common-tags');
const { DaydreamEmbed } = require('../../../daydream/');

class MessageDeleteListener extends Listener {
	constructor() {
		super('messageDelete', {
			emitter: 'client',
			event: 'messageDelete'
		});
	}

	async exec(msg) {
		if (msg.author.bot) {
			return;
		}
		if (msg.channel.type !== 'text') {
			return;
		}
		const channelID = this.client.guildSettings.get(msg.guild.id, 'logChannel');
		if (!channelID) {
			return;
		}
		const channel = msg.guild.channels.get(channelID);
		if (!channel) {
			return;
		}
		if (!channel.permissionsFor(this.client.user).has('MANAGE_WEBHOOKS')) {
			return;
		}
		const hooks = await channel.fetchWebhooks();
		let hook = hooks.first();
		if (!hook) {
			hook = await channel.createWebhook('logs', { avatar: this.client.user.displayAvatarURL({ format: 'png' }) });
		}
		const embed = new DaydreamEmbed();
		if (msg.content) {
			embed.addField('Content:', msg.content);
		}
		const attachmentSize = msg.attachments.size;
		embed.addField('Metadata:', stripIndents`
						Author: ${msg.author} \`${msg.author.tag}\` (\`${msg.author.id}\`)
						Channel: ${msg.channel} \`${msg.channel.name}\` (\`${msg.channel.id}\`)
						Message ID: \`${msg.id}\` [➜](${msg.url} 'jump to location')${attachmentSize ? `\nAttachments: ${attachmentSize}` : ''}
						`)
			.setColor(this.client.config.colors.logDelete)
			.setFooter('deleted')
			.setTitle('MESSAGE DELETED')
			.setTimestamp();

		const options = {
			avatarURL: msg.author.displayAvatarURL({ format: 'png' }),
			username: msg.author.username,
			embeds: [embed],
			files: msg.attachments.map(a => ({ attachment: a.proxyURL, name: a.name }))
		};
		return hook.send(null, options);
	}
}

module.exports = MessageDeleteListener;
