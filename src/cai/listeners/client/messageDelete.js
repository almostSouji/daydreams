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
		const embed =
			new DaydreamEmbed()
				.setTitle('Metadata')
				.setDescription(stripIndents`
						Author: ${msg.author} \`${msg.author.tag}\` (\`${msg.author.id}\`)
						Channel: ${msg.channel} \`${msg.channel.name}\` (\`${msg.channel.id}\`)
						Message ID: \`${msg.id}\` [[link]](${msg.url})
						`)
				.setColor(this.client.config.colors.logDelete)
				.setFooter('deleted')
				.setTimestamp();
		for (const e of msg.embeds) {
			e.setColor(null);
		}
		const options = {
			avatarURL: msg.author.displayAvatarURL({ format: 'png' }),
			username: msg.author.username,
			embeds: msg.embeds,
			files: msg.attachments.map(a => ({ attachment: a.proxyURL, name: a.name }))
		};
		options.embeds.push(embed);
		options.embeds = options.embeds.slice(-10);
		return hook.send(msg.content, options);
	}
}

module.exports = MessageDeleteListener;
