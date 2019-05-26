const { Command, Argument } = require('discord-akairo');
const { stripIndents } = require('common-tags');
const { format } = require('date-fns');

class NukeCommand extends Command {
	constructor() {
		super('nuke', {
			aliases: ['nuke', 'obliterate'],
			description: {
				content: '[PROTECTED FILE]... time in minutes',
				usage: '<server age to survive> <account age to survive>'
			},
			clientPermissions: ['BAN_MEMBERS'],
			userPermissions: ['ADMINISTRATOR'],
			channel: 'guild',
			args: [
				{
					id: 'joined',
					type: Argument.range('number', 0.1, Infinity, true)
				},
				{
					id: 'accountage',
					type: Argument.range('number', 0.1, Infinity, true)
				}
			]
		});
	}

	async exec(msg, { joined, accountage }) {
		await msg.util.send('Calculating nuke targets...');
		await msg.guild.members.fetch();
		const joinCutoff = Date.now() - (joined * 60000);
		const ageCutoff = Date.now() - (accountage * 60000);
		const targets = msg.guild.members.filter(
			member => member.joinedTimestamp > joinCutoff &&
				member.user.createdTimestamp > ageCutoff
		);
		await msg.util.send(`Damage calculation: ${targets.size} members will be hit, proceed?`);
		const responses = await msg.channel.awaitMessages(m => m.author.id === msg.author.id,
			{
				max: 1,
				time: 10000
			});
		if (!responses || responses.size !== 1) {
			return msg.reply('Nuke canceled.');
		}
		const response = responses.first();

		if (!['y', 'yes'].includes(response.content)) {
			return msg.reply('Nuke cancelled.');
		}

		await msg.reply(`Make sure you __really__ want to do this! This action is irreversible and is targeting ${targets.size} member(s)!`);

		const finalResponses = await msg.channel.awaitMessages(m => m.author.id === msg.author.id,
			{
				max: 1,
				time: 10000
			});

		const finalResponse = finalResponses.first();
		if (!['y', 'yes'].includes(finalResponse.content)) {
			return msg.reply('Nuke cancelled.');
		}

		const statusMessage = await finalResponse.reply('Commencing cybernuke...');

		const fatalities = [];
		const survivors = [];
		const promises = [];

		let counter = 0;

		let idx = 0;


		console.log('before loop');
		for (const member of targets.values()) {
			// promises.push(new Promise(async resolve => {
			const id = idx++;
			console.log(`${id} start`);
			console.log(`${id} ${member.user.tag}`);
			// https://github.com/discordjs/discord.js/blob/master/src/structures/interfaces/TextBasedChannel.js#L127

			// ??ev msg.guild.member("445864099172319242").send("hi")
			// setTimeout(async () => {
			try {
				const resp = await member.send(stripIndents`
					You have been hit by a nuke in \`${msg.guild.name}\`.
					This means you have been banned from the server, likely during a server raid.
					If you think this is a mistake please contact the staff of this server.

					The nuke has been commenced by ${msg.member} | \`${msg.member.displayName}\` | \`${msg.author.tag}\` (\`${msg.member.id}\`) on ${format(Date.now(), "MMM do yyyy 'at' kk:mm:ss")}`);
				console.log(`${id} after send ${resp}`);
			} catch (e) {
				console.log(`${id} send error${e}`);
			}

			try {
				await member.ban({ reason: `Cybernuke commenced by ${msg.author.tag} (${msg.author.id})` });
				console.log(`${id} after ban`);
				fatalities.push(member);
			} catch (e) {
				console.log(`${id} ban error ${e}`);
				survivors.push({
					member,
					error: e
				});
			}

			console.log(`${id} counter ${counter}`);
			counter++;
			console.log(`${id} counter ${counter}`);
			if (counter % 5 === 0) {
				await statusMessage.edit(`Launching cyber nuke (${Math.round(counter / targets.size * 100)}%)...`);
			}
			// 		resolve();
			// 	}, 0 * id);
			// }));
		}
		console.log('after loop');
		// const interval = setInterval(() => {
		// 	console.log('p', promises);
		// }, 2000);

		// await Promise.all(promises);
		// clearInterval(interval);
		await statusMessage.edit('Impact confirmed. Report incoming...');

		const report = [];
		report.push(`__**Fatalities [${fatalities.length}]**__`);
		if (fatalities.length > 0) {
			report.push(fatalities.map(fat => `**-** ${fat.displayName} (${fat.id})`).join('\n'));
		} else {
			report.push('None');
		}
		if (survivors.length > 0) {
			report.push(`__**Survivors [${survivors.length}]:**__`);
			report.push(survivors.map(srv => `**-** ${srv.member.displayName} (${srv.member.id}): \`${srv.error}\``).join('\n'));
		}
		return msg.channel.send(report.join('\n'));
	}
}
module.exports = NukeCommand;

process.on('uncaughtException', e => { console.log('e', e); });
process.on('unhandledRejection', r => { console.log('r', r); });
