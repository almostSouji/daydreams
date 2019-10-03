const { Command, Argument } = require('discord-akairo');
const { User, Permissions } = require('discord.js');
const { DaydreamEmbed } = require('../../../daydream');
const { stripIndents } = require('common-tags');
const { format, formatDistanceStrict } = require('date-fns');

const RESPONSESB = [
	'Target `$(user)` is not a bot.',
	'Unable to generate invite for `$(user)`.'
];
const RESPONSESC = [
	'Target not found',
	'The provided ID was invalid, resuming standard protocol.'
];

class BotInviteCommand extends Command {
	constructor() {
		super('bot', {
			aliases: ['bot', 'botinvite', 'binvite'],
			description: {
				content: 'Create invite for provided bot id',
				usage: '<id> [--permissions <permissionnumber>]'
			},
			clientPermissions: ['EMBED_LINKS'],
			args: [
				{
					id: 'user',
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

	async exec(msg, { user, permissions }) {
		if (!(user instanceof User)) {
			try {
				user = await this.client.users.fetch(user);
			} catch {
				return msg.util.send(
					RESPONSESC[Math.floor(Math.random() * RESPONSESC.length)]
				);
			}
		}
		if (!user.bot) {
			return msg.util.send(
				RESPONSESB[Math.floor(Math.random() * RESPONSESB.length)]
					.replace('$(user)', user.tag)
			);
		}
		const embed = new DaydreamEmbed()
			.setThumbnail(user.displayAvatarURL())
			.setTitle('Please make sure to join the server first and give yourself permissions!')
			.addField('Bot Information', stripIndents`
					Profile: ${user}
					ID: ${user.id}
					Tag: \`${user.tag}\`
					Created: ${formatDistanceStrict(user.createdAt, Date.now(), { addSuffix: true })} (${format(user.createdAt, this.client.config.dateFormat)})`, true)
			.addField('Invite', `<https://discordapp.com/oauth2/authorize?client_id=${user.id}&permissions=${permissions}&scope=bot>`)
			.addField('Permissions', `\u200B${new Permissions(permissions).toArray(false).map(perm => `\`${perm}\``)
				.join(', ')}`);
		msg.util.send('', { embed });
	}
}
module.exports = BotInviteCommand;
