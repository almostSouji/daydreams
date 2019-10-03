const { Command, Argument } = require('discord-akairo');
const { User, Permissions } = require('discord.js');
const { DaydreamEmbed } = require('../../../daydream');
const { stripIndents } = require('common-tags');
const { format, formatDistanceStrict } = require('date-fns');

const RESPONSES = [
	'Generating test environment...',
	'Building test stage...',
	'Beep boop beeep...'
];

class SandboxBuildCommand extends Command {
	constructor() {
		super('build', {
			aliases: ['build', 'create', '+', 'new', 'make'],
			description: {
				content: 'Build a new Sandbox',
				usage: '[--text <amount>] [--voice <amount>] [--category <amount>] [--nsfw <amount>] [--bot <botID>] [--permissions [number]]'
			},
			clientPermissions: ['EMBED_LINKS'],
			args: [
				{
					'id': 'text',
					'match': 'option',
					'flag': ['--text', '--txt', '--t'],
					'type': 'number',
					'default': 0
				},
				{
					'id': 'voice',
					'match': 'option',
					'flag': ['--voice', '--vc', '--v'],
					'type': 'number',
					'default': 0
				},
				{
					'id': 'categories',
					'match': 'option',
					'flag': ['--categories', '--cat', '--c'],
					'type': 'number',
					'default': 0
				},
				{
					'id': 'nsfw',
					'match': 'option',
					'flag': ['--nsfw', '--xxx', '--n'],
					'type': 'number',
					'default': 0
				},
				{
					'id': 'status',
					'match': 'option',
					'flag': ['--status', '--stat', '--s'],
					'type': ['offline', 'online', 'dnd', 'idle'],
					'default': 'offline'
				},
				{
					id: 'user',
					match: 'option',
					flag: ['--invite', '--i', '--bot', '--b'],
					type: Argument.union('user', 'string')
				},
				{
					'id': 'permissions',
					'match': 'option',
					'flag': ['--permissions', '--perms', '--p'],
					'type': 'number',
					'default': 8
				}
			]
		});
	}

	async exec(msg, { text, voice, categories, nsfw, status, user, permissions }) {
		if (this.client.guilds.size >= 10) {
			return msg.util.send('Maximum guild count reached, creation aborted.');
		}
		msg.util.send(
			RESPONSES[Math.floor(Math.random() * RESPONSES.length)]
		);

		let slot = 1;

		for (slot; slot <= this.client.sandboxes.size; slot++) {
			if (!this.client.sandboxes.some(val => val.name === `Sandbox ${slot}`)) {
				break;
			}
		}

		const guild = await this.client.guilds.create(`Sandbox ${slot}`, { icon: this.client.config.icons[status] });
		const voiceCategory = guild.channels.find(c => c.name === 'Voice Channels');
		const textCategory = guild.channels.find(c => c.name === 'Text Channels');
		const channel = await guild.channels.create('welcome', {
			type: 'text',
			parent: textCategory,
			permissionOverwrites: [
				{
					id: guild.id,
					deny: 'SEND_MESSAGES'
				}
			]
		});
		channel.setPosition(0);
		const invite = await channel.createInvite({ maxAge: 0 });


		for (let i = 0; i < text; i++) {
			await guild.channels.create(`text${i}`, { type: 'text', parent: textCategory });
		}
		for (let i = 0; i < voice; i++) {
			await guild.channels.create(`voice${i}`, { type: 'voice', parent: voiceCategory });
		}
		for (let i = 0; i < categories; i++) {
			await guild.channels.create(`category${i}`, { type: 'category' });
		}
		for (let i = 0; i < nsfw; i++) {
			await guild.channels.create(`nsfw${i}`, { type: 'text', nsfw: true, parent: textCategory });
		}

		await guild.defaultRole.setPermissions([
			'VIEW_CHANNEL',
			'SEND_MESSAGES',
			'EMBED_LINKS',
			'ATTACH_FILES',
			'READ_MESSAGE_HISTORY',
			'USE_EXTERNAL_EMOJIS',
			'CONNECT',
			'SPEAK',
			'CHANGE_NICKNAME'
		]);

		await guild.roles.create({ data: { name: 'Admin', color: 7506394, permissions: 'ADMINISTRATOR' } });
		const prefix = this.handler.prefix(msg);
		const embed = new DaydreamEmbed()
			.setThumbnail(guild.iconURL())
			.addField(`Sandbox ${slot} Information`, stripIndents`
				ID: ${guild.id}
				Owner: \`${this.client.users.get(guild.ownerID).tag}\`
				Invite: ${invite}
			`)
			.setFooter(`created by ${msg.author.tag} (${msg.author.id})`, msg.author.displayAvatarURL())
			.setTimestamp();
		await channel.send(
			stripIndents`Welcome to ${guild.name}, you can grant yourself administrator privlieges by using the command \`${prefix} admin\`.
				To return to base permissions just use it again.
				
				The guild avatar is setable based on the Discord status colors by using the command \`${prefix} status <online|dnd|idle|offline>\`
				
				When you are done with testing please use \`${prefix} delete\` to destroy this sandbox.`, embed
		);

		await guild.setDefaultMessageNotifications('MENTIONS');
		if (user) {
			if (!(user instanceof User)) {
				try {
					user = await this.client.users.fetch(user);
				} catch {
					return msg.util.send(
						embed.addField('Invite', 'Your invite target was not a valid ID')
					);
				}
			}
			if (!user.bot) {
				return msg.util.send(
					embed.addField('Invite', 'Your invite target was not a bot')
				);
			}
			embed
				.setTitle('Please make sure to join the server first and give yourself permissions!')
				.addField('Bot Information', stripIndents`
					Profile: ${user}
					ID: ${user.id}
					Tag: \`${user.tag}\`
					Created: ${formatDistanceStrict(user.createdAt, Date.now(), { addSuffix: true })} (${format(user.createdAt, this.client.config.dateFormat)})`, true)
				.addField('Invite', `<https://discordapp.com/oauth2/authorize?client_id=${user.id}&permissions=${permissions}&scope=bot>`)
				.addField('Permissions', `\u200B${new Permissions(permissions).toArray(false).map(perm => `\`${perm}\``)
					.join(', ')}`);
		}
		msg.util.send(embed);
	}
}
module.exports = SandboxBuildCommand;
