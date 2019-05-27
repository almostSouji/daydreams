/* eslint-disable no-unused-vars */
const Akairo = require('discord-akairo');
const Embed = require('../../structures/DaydreamEmbed');
const fetch = require('node-fetch');
const dateFns = require('date-fns');
const Discord = require('discord.js');
const Daydream = require('../../');
const { displayStatus, toTitleCase, groupBy, postHaste, chunkArray } = require('../../util');
const util = require('util');
/* eslint-enable no-unused-vars */

class EvalCommand extends Akairo.Command {
	constructor() {
		super('eval', {
			'aliases': ['eval', 'ev'],
			'description': {
				content: 'Evaluate code (flags customize display)',
				usage: '<code> [--input] [--noout] [--notype] [--notime] [--haste]'
			},
			'ownerOnly': true,
			'editable': true,
			'protected': true,
			'args': [
				{
					id: 'code',
					match: 'text',
					prompt: {
						start: msg => `${msg.author}, what do you want to evaluate?`
					}
				},
				{
					id: 'input',
					match: 'flag',
					flag: ['--input', '--in', '--i']
				},
				{
					id: 'noout',
					match: 'flag',
					flag: ['--noout', '--nout', '--no']
				},
				{
					id: 'notype',
					match: 'flag',
					flag: ['--notype', '--notp']
				},
				{
					id: 'notime',
					match: 'flag',
					flag: ['--notime', '--noti']
				},
				{
					id: 'haste',
					match: 'flag',
					flag: ['--haste', '--h']
				}
			]
		});
	}

	async exec(msg, { code, input, noout, notype, notime, haste }) {
		function clean(text, token) {
			if (typeof text === 'string') {
				text = text.replace(/`/g, `\`${String.fromCharCode(8203)}`).replace(/@/g, `@${String.fromCharCode(8203)}`);

				return text.replace(new RegExp(token, 'gi'), '****');
			}

			return text;
		}
		let evaled;
		try {
			const hrStart = process.hrtime();
			evaled = eval(code); // eslint-disable-line no-eval

			if (evaled instanceof Promise) evaled = await evaled;
			const hrStop = process.hrtime(hrStart);

			let response = '';
			if (input) {
				response += `\nInput:\`\`\`js\n${code}\n\`\`\``;
			}
			if (!noout) {
				response += `Output:\`\`\`js\n${clean(util.inspect(evaled, { depth: 0 }), this.client.token)}\n\`\`\``;
			}
			if (!notype && !noout) {
				response += `• Type: \`${typeof evaled}\``;
			}
			if (!noout && !notime) {
				response += ` • time taken: \`${(((hrStop[0] * 1e9) + hrStop[1])) / 1e6}ms\``;
			}
			if (haste) {
				const hasteLink = await postHaste(clean(util.inspect(evaled), this.client.token), 'js');
				response += `\n• Full Inspect: ${hasteLink}`;
			}
			if (response.length > 0) {
				await msg.util.send(response);
			}
		} catch (err) {
			if (err.message === 'Invalid Form Body\ncontent: Must be 2000 or fewer in length.' && evaled) {
				const hasteLink = await postHaste(clean(util.inspect(evaled), this.client.token));
				return msg.util.send(`Output too long, trying to upload it to hastebin instead: ${hasteLink}`);
			}
			this.client.logger.info(`Eval error: ${err.stack}`);
			return msg.util.send(`Error:\`\`\`xl\n${clean(err)}\n\`\`\``);
		}
	}
}
module.exports = EvalCommand;
