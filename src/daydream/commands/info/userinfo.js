const { Command, Argument, version: aVersion } = require('discord-akairo');
const { GuildMember, User, version, Permissions } = require('discord.js');
const { stripIndents } = require('common-tags');
const { DaydreamEmbed } = require('../../index');
const { format, formatDistanceStrict, formatDistance } = require('date-fns');
const { toTitleCase, displayStatus } = require('../../util');

class UserInfoCommand extends Command {
	constructor() {
		super('userinfo', {
			aliases: ['userinfo', 'user', 'member', 'uinfo', 'minfo'],
			description: {
				content: 'Display information about provided user (`--permissions` to show permissions, `--color` to display with role color)',
				usage: '[user] [--permissions] [--color]'
			},
			editable: true,
			clientPermissions: ['EMBED_LINKS'],
			args: [
				{
					'id': 'target',
					'type': Argument.union('member', 'string'),
					'default': message => message.member || message.author
				},
				{
					id: 'permissions',
					match: 'flag',
					flag: ['--permissions', '--perms', '--p']
				},
				{
					id: 'color',
					match: 'flag',
					flag: ['--color', '--c']
				}
			]
		});
	}

	showStatus(ref) {
		const statusSymbol = displayStatus(this.client, ref.presence.status, ref.guild);
		if (ref.guild && ref.guild.me.hasPermission('USE_EXTERNAL_EMOJIS')) {
			return `${toTitleCase(ref.presence.status)}${statusSymbol}`;
		}
		return toTitleCase(ref.presence.status);
	}

	async buildInfoEmbed(invoke, ref, permissions, color) {
		const user = ref instanceof GuildMember ? ref.user : ref;

		const embed = new DaydreamEmbed()
			.setThumbnail(user.displayAvatarURL())
			.addField(`${user.bot ? 'Bot' : 'User'} Information`, stripIndents`
					Profile: ${ref}
					ID: ${ref.id}
					Tag: \`${user.tag}\`
					Status: ${this.showStatus(ref)}
					Created: ${formatDistanceStrict(user.createdAt, Date.now(), { addSuffix: true })} (${format(user.createdAt, this.client.config.dateFormat)})`, true);

		if (ref instanceof GuildMember) {
			let infoString = stripIndents`${ref.nickname ? `Nickname: \`${ref.nickname}\`` : ''}
					Joined: ${formatDistanceStrict(ref.joinedAt, Date.now(), { addSuffix: true })} (${format(ref.joinedAt, this.client.config.dateFormat)})`;
			const roleList = ref.roles.filter(r => r.id !== r.guild.id).map(fr => `\`${fr.name}\``);
			if (roleList.length > 0) {
				infoString += `\nRoles [${roleList.length}]: ${roleList.join(', ')}`;
			}
			if (ref.voice.channel) {
				infoString += `\nVoicechannel: ${ref.voice.channel.name}`;
			}
			embed.addField('Member Information', infoString, true);
			if (ref.displayColor && (!embed.color || color)) {
				embed.setColor(ref.displayColor);
			}
			if (permissions) {
				embed.addField(`Permissions in this channel`, invoke.channel.permissionsFor(ref).toArray(false).map(perm => `\`${perm}\``)
					.join(', '));
			}
		}
		const userActivity = ref.presence.activity;
		if (userActivity) {
			const spotify = userActivity.name === 'Spotify' ? true : false;
			let activityString = `${userActivity.type.toLowerCase()} ${userActivity.type === 'LISTENING' ? 'to' : ''} ${userActivity.name}`;
			if (!spotify && userActivity.timestamps && userActivity.timestamps.start) {
				activityString += ` for ${formatDistance(Date.now(), userActivity.timestamps.start)}`;
			}
			if (spotify) {
				const { start, end } = userActivity.timestamps;
				const now = Date.now();
				const timeIn = format(now - start, 'mm:ss');
				const duration = format(end - start, 'mm:ss');
				activityString += ` (${timeIn}/${duration})`;
			}
			if (userActivity.details) {
				activityString += `\n${spotify ? 'Title' : 'Details'}: ${userActivity.details}`;
			}
			if (userActivity.state) {
				activityString += `\n${spotify ? 'By' : 'State'}: ${userActivity.state}`;
			}
			if (userActivity.assets) {
				let footerString = '';
				if (userActivity.assets.largeText && userActivity.assets.smallText) {
					footerString += `\n${userActivity.assets.largeText} (${userActivity.assets.smallText})`;
				} else if (userActivity.assets.largeText && !userActivity.assets.smallText) {
					footerString += `\n${userActivity.assets.largeText}`;
				} else if (!userActivity.assets.largeText && userActivity.assets.smallText) {
					footerString += `\n${userActivity.assets.smallText}`;
				}

				if (userActivity.assets.largeImage) {
					embed.setFooter(`${spotify ? 'Album:' : ''}${footerString}`, userActivity.assets.largeImageURL());
				}
			}
			if (userActivity.url) {
				activityString += `\nUrl: ${userActivity.url}`;
			}

			embed.addField(`${spotify ? 'Song Information' : 'Activity'}`, activityString, false);
		}
		if (ref.id === this.client.user.id) {
			const creator = await this.client.users.fetch('83886770768314368');
			const permissionArray = [...new Set(this.handler.modules.reduce((a, e) => a.concat(e.clientPermissions), []).filter(e => e))];
			const perm = new Permissions(permissionArray);
			const botStatsString = `Guilds: ${this.client.guilds.size} | Users: ${this.client.users.size} | Channels: ${this.client.channels.size}`;
			const botInfoString = stripIndents`
					Runtime: Node ${process.version}
					Library: Discord.js ${version}
					Framework: Akairo ${aVersion}

					[Invite me to your server](https://discordapp.com/oauth2/authorize?client_id=${this.client.user.id}&permissions=${perm.bitfield}&scope=bot)`;
			embed
				.addField('Stats', botStatsString, false)
				.addField('Bot Information', botInfoString, false)
				.setFooter(`Coded with 🍵 by ${creator.username} | running on Node.js ${process.version}`, creator.displayAvatarURL());
		}


		return embed.applySpacers().shorten();
	}

	async exec(msg, { target, permissions, color }) {
		if (target instanceof GuildMember || target instanceof User) {
			return msg.util.send(await this.buildInfoEmbed(msg, target, permissions, color));
		}

		try {
			let queryFetch = await msg.guild.members.fetch({ query: target, limit: 1 });
			if (!queryFetch.size) {
				queryFetch = await msg.guild.members.fetch(target);
			}
			if (queryFetch.size) {
				return msg.util.send('', await this.buildInfoEmbed(msg, queryFetch.first, permissions, color));
			}
			throw new Error('no member');
		} catch (err) {
			return msg.util.send(`✘ Can not convert \`${target}\` to \`user\``);
		}
	}
}
module.exports = UserInfoCommand;
