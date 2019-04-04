const { Command } = require('discord-akairo');
const { Util: ddUtil } = require('../../../daydream');
const XivEmbed = require('../../structures/XivdbEmbed.js');
const { stripIndents } = require('common-tags');
const { format, formatDistanceStrict, fromUnixTime } = require('date-fns');

class FreeCompanyCommand extends Command {
	constructor() {
		super('freecompany', {
			aliases: ['freecompany', 'fc', 'freecomp', 'fcomp', 'fcompany', 'freec'],
			description: {
				content: 'Display FFXIV free company information based on free company id or server and name',
				usage: '<id> | <server> <company name>'
			},
			editable: false,
			args: [
				{
					id: 'serverOrID',
					type: 'lowercase'
				},
				{
					id: 'name',
					match: 'rest'
				}
			]
		});
	}

	buildInfoEmbed(fc) {
		const datacenter = ddUtil.getKeyByValue(this.client.xiv.resources.datacenters, v => v.includes(fc.Server));
		let infoString = stripIndents`
			Name: [${fc.Name}](https://eu.finalfantasyxiv.com/lodestone/freecompany/${fc.ID} 'view  ${fc.Name} [${fc.Tag}] (${fc.Server}) on the Lodestone')
			Members: ${fc.ActiveMemberCount}
			Standing: ${fc.GrandCompany} (${fc.Reputation.find(e => e.Name === fc.GrandCompany).Rank})${fc.Ranking.Monthly === '--' ? '' : ` monthly: ${fc.Ranking.Monthly}`}${fc.Ranking.Weekly === '--' ? '' : `weekly: ${fc.Ranking.Weekly}`}
			Formed: ${formatDistanceStrict(fromUnixTime(fc.Formed), Date.now(), { addSuffix: true })} (${format(fromUnixTime(fc.Formed), this.client.config.dateFormat)})
`;
		if (fc.Focus.length) {
			const focus = fc.Focus.filter(f => f.Status);
			infoString += `\nFocus: ${focus.map(f => f.Name).join(', ')}`;
		}

		if (fc.Recruitment === 'Closed') {
			infoString += '\nRecruitment: Closed';
		} else if (fc.Seeking.length) {
			const seeking = fc.Seeking.filter(s => s.Status);
			infoString += `\nRecruitment: Open (seeking: ${seeking.map(s => s.Name).join(', ')})`;
		}

		const embed = new XivEmbed()
			.attachFiles([{ attachment: fc.Crest[fc.Crest.length - 1], name: 'crest.jpg' }])
			.setAuthor(`${fc.Name} [${fc.Tag}] on ${fc.Server} (${datacenter})`, fc.Crest[fc.Crest.length - 1], `https://eu.finalfantasyxiv.com/lodestone/freecompany/${fc.ID}/`)
			.addField('Company Information', infoString)
			.setThumbnail('attachment://crest.jpg');
		if (fc.Slogan.length) {
			embed.setDescription(`\`${fc.Slogan}\``);
		}
		if (fc.Estate) {
			let estateString = `Name: ${fc.Estate.Name}\nPlot: ${fc.Estate.Plot}`;
			if (fc.Estate.Greeting && fc.Estate.Greeting !== '-') {
				estateString += `\nGreeting: \`${fc.Estate.Greeting}\``;
			}
			embed.addField('Estate:', estateString);
		}
		return embed.applySpacers().shorten();
	}

	async exec(msg, { serverOrID, name }) {
		const fetching = await msg.util.send(`Fetching information...`);
		try {
			const fc = await this.client.xivresolver.resolveFreeCompany(serverOrID, name);
			if (!fc) {
				return msg.util.send(`✘ No information found for server: \`${serverOrID}\`, name: \`${name}\``);
			}
			await fetching.delete();
			return msg.util.send('', this.buildInfoEmbed(fc));
		} catch (err) {
			if (['invalid arguments', 'missing name'].includes(err.message)) {
				return msg.util.send('✘ Invalid arguments, please use a valid free company ID or `<server> <name>` combination ');
			}
			if (err.message === 'no parameters') {
				return msg.util.send('✘ No arguments given, please use a valid free company ID or `<server> <name>` combination ');
			}
			throw err;
		}
	}
}
module.exports = FreeCompanyCommand;
