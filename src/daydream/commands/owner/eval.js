const Akairo = require('discord-akairo');
const util = require('util');
const { MESSAGES, SENSITIVE_PATTERN_REPLACEMENT } = require('../../util/constants');
/* eslint-disable no-unused-vars */
const Embed = require('../../structures/DaydreamEmbed');
const fetch = require('node-fetch');
const dateFns = require('date-fns');
const Discord = require('discord.js');
const Daydream = require('../../');
const { displayStatus, toTitleCase, groupBy, postHaste, chunkArray } = require('../../util');
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

	clean(text) {
		if (typeof text === 'string') {
			text = text.replace(/`/g, `\`${String.fromCharCode(8203)}`).replace(/@/g, `@${String.fromCharCode(8203)}`);

			return text.replace(new RegExp(this.client.token, 'gi'), SENSITIVE_PATTERN_REPLACEMENT);
		}

		return text;
	}

	async exec(msg, { code, input, noout, notype, notime, haste }) {
		let evaled;
		try {
			const hrStart = process.hrtime();
			evaled = eval(code); // eslint-disable-line no-eval

			if (evaled instanceof Promise) evaled = await evaled;
			const hrStop = process.hrtime(hrStart);

			let response = '';
			if (input) {
				response += MESSAGES.COMMANDS.EVAL.INPUT(code);
			}
			if (!noout) {
				response += MESSAGES.COMMANDS.EVAL.OUTPUT(this.clean(util.inspect(evaled, { depth: 0 })));
			}
			if (!notype && !noout) {
				response += `• Type: \`${typeof evaled}\``;
			}
			if (!noout && !notime) {
				response += ` • time taken: \`${(((hrStop[0] * 1e9) + hrStop[1])) / 1e6}ms\``;
			}
			if (haste) {
				const hasteLink = await postHaste(this.clean(util.inspect(evaled)), 'js');
				response += `\n• Full Inspect: ${hasteLink}`;
			}
			if (response.length > 20000) {
				try {
					const hasteLink = await postHaste(this.clean(util.inspect(evaled)));
					return msg.util.send(MESSAGES.COMMANDS.LONG_OUTPUT(hasteLink));
				} catch (hasteerror) {
					return msg.util.send(MESSAGES.COMMANDS.EVAL.ERRORS.TOO_LONG);
				}
			}
			if (response.length > 0) {
				await msg.util.send(response);
			}
		} catch (err) {
			this.client.logger.info(MESSAGES.LOGGER('[EVAL ERROR]', err.stack));
			return msg.util.send(MESSAGES.COMMANDS.EVAL.ERRORS.CODE_BLOCK(this.clean(err)));
		}
	}
}
module.exports = EvalCommand;
