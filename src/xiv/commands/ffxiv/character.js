const { Command } = require('discord-akairo');
const { Util: ddUtil } = require('../../../daydream');
const XivEmbed = require('../../structures/XivdbEmbed.js');
const { stripIndents } = require('common-tags');

const gearSort = {
	'MainHand': 0,
	'OffHand': 1,
	'Head': 2,
	'Body': 3,
	'Hands': 4,
	'Waist': 5,
	'Legs': 6,
	'Feet:': 7,
	'Earrings': 8,
	'Necklace': 9,
	'Bracelets': 10,
	'Ring1': 11,
	'Ring2': 12,
	'SoulCrystal': 13
};

class CharacterCommand extends Command {
	constructor() {
		super('character', {
			aliases: ['character', 'char', 'find', 'charinfo', 'ffxivchar', 'xivchar'],
			description: {
				content: 'Display FFXIV character information based on character id or server and name (`--gear` to display current equipment, `--stats` to show relevant attributes)',
				usage: '<id> | <server> <forename> <surname>'
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
				},
				{
					id: 'showstats',
					match: 'flag',
					flag: ['--stats', '--s', '--showstats']
				},
				{
					id: 'showgear',
					match: 'flag',
					flag: ['--gear', '--g', '--showgear', '--attributes']
				}
			]
		});
	}


	async buildInfoEmbed(char, showstats, showgear) {
		const datacenter = ddUtil.getKeyByValue(this.client.xiv.resources.datacenters, v => v.includes(char.Server));
		const classOrJob = char.GearSet.Gear.SoulCrystal ? char.ActiveClassJob.Job : char.ActiveClassJob.Class;
		const infoString = stripIndents`
			Name: [${char.Name}](https://eu.finalfantasyxiv.com/lodestone/character/${char.ID} 'view  ${char.Name} (${char.Server}) on the Lodestone') ${char.Title.Name.length ? `"${char.Title.Name}"` : ''}
			Race: ${char.Race.Name} - ${char.Tribe.Name}
			Minions: ${char.MinionsCount}/${char.MinionsTotal} (${char.MinionsProgress}% complete)
			Mounts: ${char.MountsCount}/${char.MountsTotal} (${char.MountsProgress}% complete)
		`;
		let companyString = '';
		const gc = char.GrandCompany;
		if (gc.Company) {
			companyString += `\nGrand Company: ${gc.Company.Name} (${gc.Rank.Name})`;
		}
		if (char.FreeCompanyId) {
			const fc = await this.client.xivresolver.resolveFreeCompany(char.FreeCompanyId);
			companyString += `\nFree Company: [${fc.Name} [${fc.Tag}]](https://eu.finalfantasyxiv.com/lodestone/freecompany/${char.FreeCompanyId} 'view  ${fc.Name} [${fc.Tag}] on the Lodestone')`;
		}

		const embed = new XivEmbed(char.ParseDate)
			.attachFiles([{ attachment: char.Avatar, name: 'avatar.jpg' }])
			.setAuthor(`${char.Name} on ${char.Server} (${datacenter})`, this.client.xivapi + classOrJob.Icon, `https://eu.finalfantasyxiv.com/lodestone/character/${char.ID}/`)
			.addField('Character Information', infoString)
			.setThumbnail('attachment://avatar.jpg');
		if (char.Bio !== '-') {
			embed.setDescription(`\`${char.Bio}\``);
		}
		if (companyString.length) {
			embed.addField('Affiliations', companyString);
		}
		const gs = char.GearSet;
		if (showstats) {
			embed.addField('Stats', gs.Attributes.map(a => `${a.Attribute.Name}: ${a.Value}`).join(' | '));
		}
		if (showgear) {
			const sortedGearKeys = Object.keys(gs.Gear).sort((a, b) => gearSort[a] - gearSort[b]);
			const gear = sortedGearKeys.map(key => {
				const g = gs.Gear[key];
				return `**${key}**: ${g.Item.Name}${g.Materia.length ? ` ${g.Materia.map(() => '•').join(' ')}` : ''}${g.Mirage ? `\nGlamour: (${g.Mirage.Name})` : ''}`;
			});
			embed.addField('Equipped gear', gear.join('\n'));
		}
		return embed.shorten();
	}

	async exec(msg, { serverOrID, name, showstats, showgear }) {
		const fetching = await msg.util.send('Fetching information...');
		try {
			const char = await this.client.xivresolver.resolveCharacter(serverOrID, name);
			if (!char) {
				return msg.util.send(`✘ No information found for server: \`${serverOrID}\`, name: \`${name}\``);
			}

			await msg.util.send('', await this.buildInfoEmbed(char, showstats, showgear));
			return fetching.delete();
		} catch (err) {
			if (err.message === 'invalid server') {
				return msg.util.send('✘ Invalid server name, please use a valid character ID or `<server> <name> <surname>` combination');
			}
			if (['invalid arguments', 'missing name'].includes(err.message)) {
				return msg.util.send('✘ Invalid arguments, please use a valid character ID or `<server> <name> <surname>` combination');
			}
			if (err.message === 'no parameters') {
				return msg.util.send('✘ No arguments given, please use a valid character ID or `<server> <name> <surname>` combination');
			}
			throw err;
		}
	}
}
module.exports = CharacterCommand;
