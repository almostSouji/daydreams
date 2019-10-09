const { Command, Argument } = require('discord-akairo');
const { MESSAGES } = require('../../util/constants');

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
			return msg.util.send(MESSAGES.ERRORS.TARGET('user to blacklist'));
		}
		if (typeof target === 'string') {
			try {
				target = await this.client.users.fetch(target);
			} catch (_) {
				return msg.util.send(MESSAGES.ERRORS.RESOLVE(target, 'user'));
			}
		}
		try {
			const result = await this.client.db.models.blacklist.findOne({
				where: {
					user: target.id
				}
			});
			await msg.util.send(MESSAGES.COMMANDS.BLACKLIST.PROMPT(target, reason, result));
			const responses = await msg.channel.awaitMessages(m => m.author.id === msg.author.id,
				{
					max: 1,
					time: 10000
				});
			if (!responses || responses.size !== 1) {
				return msg.util.send(MESSAGES.ERRORS.CANCEL);
			}
			const response = responses.first();
			if (!['y', 'yes'].includes(response.content)) {
				return msg.util.send(MESSAGES.ERRORS.CANCEL);
			}
			if (result) {
				await result.destroy();
			} else {
				await this.client.db.models.blacklist.create({
					user: target.id,
					reason
				});
			}
			return msg.util.send(MESSAGES.COMMANDS.BLACKLIST.SUCCESS(result, target));
		} catch (err) {
			return msg.util.send(MESSAGES.ERRORS.CANCEL_WITH_ERROR(err));
		}
	}
}
module.exports = BlacklistCommand;
