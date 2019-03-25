const { Command } = require('discord-akairo');
const { postHaste } = require('../../util');
const { promisify } = require('util');

class ExecCommand extends Command {
	constructor() {
		super('exec', {
			'aliases': ['exec', 'exe'],
			'description': {
				content: 'Execute shell code (flags customize output)',
				usage: '<code> [--haste] [--noout]'
			},
			'ownerOnly': true,
			'protected': true,
			'args': [
				{
					id: 'code',
					match: 'text'
				},
				{
					id: 'haste',
					match: 'flag',
					flag: ['--haste', '--h']
				},
				{
					id: 'noout',
					match: 'flag',
					flag: ['--noout', '--nout', '--no']
				}
			]
		});
	}

	async exec(msg, { code, haste, noout }) {
		const exec = promisify(require('child_process').exec);
		try {
			const res = await exec(code, { windowsHide: true });
			const { stdout, stderr } = res;
			if (haste) {
				const hastelink = await postHaste(`${stdout ? stdout : ''}${stdout && stderr ? '\n>>>>>>>>>>>\n' : ''}${stderr ? `${stderr}` : ''}`, 'xl');
				return msg.util.send(`Output: <${hastelink}>`);
			}
			if ((stdout || stderr) && !noout) {
				return msg.util.send(`${stdout ? stdout : ''}${stdout && stderr ? '\n>>>>>>>>>>>\n' : ''}${stderr ? `${stderr}` : ''}`, { code: 'xl', split: true });
			}
		} catch (err) {
			this.client.logger.error(err);
			return msg.util.send(err, { code: 'xl', split: true });
		}
	}
}
module.exports = ExecCommand;
