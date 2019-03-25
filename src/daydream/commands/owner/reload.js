const { Command, Argument, Listener } = require('discord-akairo');

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
				return msg.util.send('✓ Reloaded all commands and listeners');
			} catch (err) {
				return msg.util.send(`✘ Could not reload: \`${err}\``);
			}
		}
		if (!commandOrListener) {
			return msg.util.send(`✘ No target provided, please provide a valid command.`);
		}
		if (commandOrListener instanceof Command) {
			try {
				await this.client.commandHandler.reload(commandOrListener);
				return msg.util.send(`✓ Reloaded command \`${commandOrListener}\``);
			} catch (err) {
				return msg.util.send(`✘ Could not reload \`${commandOrListener}\`: \`${err}\``);
			}
		}
		if (commandOrListener instanceof Listener) {
			try {
				await this.client.listenerHandler.reload(commandOrListener);
				return msg.util.send(`✓ Reloaded eventlistener \`${commandOrListener}\``);
			} catch (err) {
				return msg.util.send(`✘ Could not reload \`${commandOrListener}\`: \`${err}\``);
			}
		}
		return msg.util.send(`✘ Can not convert \`${commandOrListener}\` to \`command or listener\``);
	}
}
module.exports = ReloadCommand;
