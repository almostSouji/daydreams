const { Command, Argument } = require('discord-akairo');

class BlacklistCommand extends Command {
	constructor() {
		super('blacklist', {
			'aliases': ['blacklist', 'bl', 'black', 'unblacklist', 'unbl', 'un-bl', 'unblack', 'un-black'],
			'description': {
				content: 'Un/prevent the provided user from using the bot',
				usage: '<user>'
			},
			'ownerOnly': true,
			'protected': true,
			'args': [
				{
					id: 'target',
					type: Argument.union('user', 'string')
				},
				{
					id: 'reason',
					match: 'rest'
				}
			]
		});
	}

	async exec(msg, { target, reason }) {
		if (!target) {
			return msg.util.send('✘ Provide a user to blacklist');
		}
		if (typeof target === 'string') {
			try {
				target = await this.client.users.fetch(target);
			} catch (_) {
				return msg.util.send(`✘ Invalid user: \`${target}\``);
			}
		}
		try {
			const result = await this.client.db.models.blacklist.findOne({
				where: {
					user: target.id
				}
			});
			await msg.util.send(`Are you sure you want to ${result ? 'un' : ''}blacklist \`${target.tag}\` (${target.id})${!result && reason ? ` with reason: \`${reason}\`` : ''}?${result && result.reason ? ` They are blacklisted for the reason: \`${reason}\`.` : ''}`);
			const responses = await msg.channel.awaitMessages(m => m.author.id === msg.author.id,
				{
					max: 1,
					time: 10000
				});
			if (!responses || responses.size !== 1) {
				return msg.util.send('✘ Action cancelled.');
			}
			const response = responses.first();
			if (!['y', 'yes'].includes(response.content)) {
				return msg.util.send('✘ Action cancelled.');
			}
			if (result) {
				await result.destroy();
			} else {
				await this.client.db.models.blacklist.create({
					user: target.id,
					reason
				});
			}
			return msg.util.send(`✓ ${result ? 'Unb' : 'B'}lacklisted \`${target.tag}\` (${target.id})`);
		} catch (err) {
			return msg.util.send(`✘ Action cancelled, something went wrong. \`${err}\``);
		}
	}
}
module.exports = BlacklistCommand;
