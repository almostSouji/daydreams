const { Command, Argument, Listener } = require('discord-akairo');
const { MESSAGES } = require('../../util/constants');

class ReloadCommand extends Command {
	constructor() {
		super('reload', {
			'aliases': ['reload', 'rel', 're'],
			'description': {
				content: 'Reload provided command or listener (`--all` to reload all commands and listeners)',
				usage: '<command or listener> [--all]'
			},
			'ownerOnly': true,
			'protected': true,
			'args': [
				{
					id: 'commandOrListener',
					type: Argument.union('commandAlias', 'listener', 'string')
				},
				{
					id: 'all',
					match: 'flag',
					flag: ['--all', '--a']
				}
			]
		});
	}

	async exec(msg, { commandOrListener, all }) {
		if (all) {
			try {
				await this.client.commandHandler.reloadAll();
				await this.client.listenerHandler.reloadAll();
				return msg.util.send(MESSAGES.COMMANDS.RELOAD.SUCCESS.ALL);
			} catch (err) {
				return msg.util.send(MESSAGES.COMMANDS.RELOAD.ERRORS.ALL(err));
			}
		}
		if (!commandOrListener) {
			return msg.util.send(MESSAGES.ERRORS.TARGET('command or listener'));
		}
		if (commandOrListener instanceof Command) {
			try {
				await this.client.commandHandler.reload(commandOrListener);
				return msg.util.send(MESSAGES.COMMANDS.RELOAD.SUCCESS.ONE(commandOrListener, 'command'));
			} catch (err) {
				return msg.util.send(MESSAGES.COMMANDS.RELOAD.ERRORS.ONE(commandOrListener, 'command', err));
			}
		}
		if (commandOrListener instanceof Listener) {
			try {
				await this.client.listenerHandler.reload(commandOrListener);
				return msg.util.send(MESSAGES.COMMANDS.RELOAD.SUCCESS.ONE(commandOrListener, 'listener'));
			} catch (err) {
				return msg.util.send(MESSAGES.COMMANDS.RELOAD.ERRORS.ONE(commandOrListener, 'listener', err));
			}
		}
		return msg.util.send(MESSAGES.ERRORS.RESOLVE(commandOrListener), 'command or listener');
	}
}
module.exports = ReloadCommand;
