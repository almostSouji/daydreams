const { Listener } = require('discord-akairo');
const { stripIndents } = require('common-tags');
const { DaydreamEmbed } = require('../../../daydream/');

class MessageUpdateListener extends Listener {
	constructor() {
		super('messageUpdate', {
			emitter: 'client',
			event: 'messageUpdate'
		});
	}

	async exec(oM, nM) {
		if (oM.channel.type !== 'text') {
			return;
		}
		if (oM.author.bot) {
			return;
		}
		if (oM.content === nM.content) {
			return;
		}
		if (!oM.content && !nM.content) {
			return;
		}
		const channelID = this.client.guildSettings.get(oM.guild.id, 'logChannel');
		if (!channelID) {
			return;
		}
		const channel = oM.guild.channels.get(channelID);
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
		const update = new DaydreamEmbed()
			.addField('Old content:', oM.content)
			.addField('New content:', nM.content);
		const embed =
			new DaydreamEmbed()
				.setTitle('Metadata')
				.setDescription(stripIndents`
						Author: ${oM.author} \`${oM.author.tag}\` (\`${oM.author.id}\`)
						Channel: ${oM.channel} \`${oM.channel.name}\` (\`${oM.channel.id}\`)
						Message: \`${oM.id}\` [[link]](${oM.url})
						`)
				.setColor(this.client.config.colors.logEdit)
				.setFooter('edited')
				.setTimestamp();

		const options = {
			avatarURL: oM.author.displayAvatarURL({ format: 'png' }),
			username: oM.author.username,
			embeds: [update, embed]
		};
		return hook.send(null, options);
	}
}

module.exports = MessageUpdateListener;
