const { Command } = require('discord-akairo');
const RESPONSESA = [
	'Removed `$(role)` from `$(user)`.',
	'Done.',
	'Override access revoked'
];
const RESPONSESB = [
	'Added `$(role)` to `$(user)`.',
	'Done.',
	'Beep... beep... <looks like it worked>',
	'Override access granted!'
];

class SandboxRoleCommand extends Command {
	constructor() {
		super('admin', {
			aliases: ['admin', 'adm', 'a', 'toggle'],
			description: {
				content: 'Grant yourself the Admin role on a sandbox',
				usage: ''
			}
		});
	}

	async exec(msg) {
		if (!msg.guild.sandbox) return;
		let adminRole = msg.guild.roles.find(val => val.name === 'Admin' && val.permissions.has('ADMINISTRATOR'));

		if (!adminRole) {
			adminRole = await msg.guild.roles.create({ data: { name: 'Admin', color: 7506394, permissions: 'ADMINISTRATOR' } });
		}

		if (msg.member.roles.has(adminRole.id)) {
			await msg.member.roles.remove(adminRole);
			return msg.util.send(
				RESPONSESA[Math.floor(Math.random() * RESPONSESA.length)]
					.replace('$(role)', adminRole.name)
					.replace('$(user)', msg.member.displayName)
			);
		}

		await msg.member.roles.add(adminRole);
		return msg.util.send(
			RESPONSESB[Math.floor(Math.random() * RESPONSESB.length)]
				.replace('$(role)', adminRole.name)
				.replace('$(user)', msg.member.displayName)
		);
	}
}
module.exports = SandboxRoleCommand;
