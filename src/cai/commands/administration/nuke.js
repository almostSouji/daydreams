const { Command, Argument } = require('discord-akairo');
const { stripIndents } = require('common-tags');
const { format } = require('date-fns');

class NukeCommand extends Command {
	constructor() {
		super('nuke', {
			aliases: ['nuke', 'cybernuke', 'antiraidnuke'],
			description: {
				content: '[PROTECTED FILE]... time in minutes',
				usage: '<min server age to survive> <min account age to survive>'
			},
			clientPermissions: ['BAN_MEMBERS'],
			userPermissions: ['ADMINISTRATOR'],
			channel: 'guild',
			args: [
				{
					id: 'joinedBefore',
					type: Argument.range('number', 0.1, Infinity, true)
				},
				{
					id: 'olderThan',
					type: Argument.range('number', 0.1, Infinity, true)
				}
			]
		});
	}

	async exec(msg, { joinedBefore, olderThan }) {
		await msg.util.send('Calculating nuke targets...');
		await msg.guild.members.fetch();
		const joinCutoff = Date.now() - (joinedBefore * 60000);
		const ageCutoff = Date.now() - (olderThan * 60000);
		const targets = msg.guild.members.filter(
			member => member.joinedTimestamp > joinCutoff &&
				member.user.createdTimestamp > ageCutoff
		);
		await msg.util.send(`Damage calculation: ${targets.size} members will be hit, proceed? [y]es`);
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

		await msg.reply(`Make sure you __really__ want to do this! This action is irreversible and is targeting ${targets.size} member(s) that are about to be banned! [y]es`);

		const finalResponses = await msg.channel.awaitMessages(m => m.author.id === msg.author.id,
			{
				max: 1,
				time: 10000
			});

		const finalResponse = finalResponses.first();
		if (!['y', 'yes'].includes(finalResponse.content)) {
			return msg.reply('Nuke cancelled.');
		}

		const statusMessage = await finalResponse.reply('Commencing nuke...');

		const fatalities = [];
		const survivors = [];

		let counter = 0;
		for (const member of targets.values()) {
			member.send(stripIndents`
					You have been hit by a nuke in \`${msg.guild.name}\`.
					This means you have been banned from the server, likely during a server raid.
					If you think this is a mistake please contact the staff of this server.

					The nuke has been commenced by ${msg.member} | \`${msg.member.displayName}\` | \`${msg.author.tag}\` (\`${msg.member.id}\`) on ${format(Date.now(), "MMM do yyyy 'at' kk:mm:ss")}`).catch(() => {});

			try {
				await member.ban({ reason: `Nuke commenced by ${msg.author.tag} (${msg.author.id})` });
				fatalities.push(member);
			} catch (e) {
				survivors.push({
					member,
					error: e
				});
			}
			counter++;
			if (counter % 5 === 0) {
				await statusMessage.edit(`Launching nuke (${Math.round(counter / targets.size * 100)}%)...`);
			}
		}
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
		return msg.channel.send(report.join('\n'), { split: true });
	}
}
module.exports = NukeCommand;
