const { join } = require('path');
const { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler, SequelizeProvider } = require('discord-akairo');
const { readdirSync } = require('fs');
const { createLogger, transports, format } = require('winston');
const database = require('../structures/Database');

class DaydreamClient extends AkairoClient {
	constructor(config) {
		super({ ownerID: config.owner }, {
			disableEveryone: true,
			disabledEvents: ['TYPING_START']
		});
		this.commandHandler = new CommandHandler(this, {
			directory: join(__dirname, '..', 'commands'),
			prefix: message => {
				if (message.guild) {
					return this.guildSettings.get(message.guild.id, 'prefix', this.config.prefix);
				}
				return this.config.prefix;
			},

			handleEdits: true,
			commandUtil: true,
			commandUtilLifetime: 600000,
			automateCategories: true,
			allowMention: true,
			ignorePermissions: this.ownerID
		});

		this.inhibitorHandler = new InhibitorHandler(this, { directory: join(__dirname, '..', 'inhibitors'), automateCategories: true });
		this.listenerHandler = new ListenerHandler(this, { directory: join(__dirname, '..', 'listeners'), automateCategories: true });
		this.listenerHandler.setEmitters({
			commandHandler: this.commandHandler,
			inhibitorHandler: this.inhibitorHandler,
			listenerHandler: this.listenerHandler
		});

		this.guildSettings = new SequelizeProvider(
			database.models.settings, {
				idColumn: 'guild',
				dataColumn: 'settings'
			}
		);

		this.logger = createLogger({
			format: format.combine(
				format.colorize({ tag: true }),
				format.timestamp({ format: 'YYYY/MM/DD HH:mm:ss' }),
				format.printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`)
			),
			transports: [new transports.Console()]
		});
		this.db = database;
		this.config = config;
		this.hubGuildID = config.hubGuild;
	}

	get hubGuild() {
		return this.guilds.get(this.hubGuildID);
	}

	async start() {
		await this.db.sync();
		return this.login(this.config.token);
	}
}

const extensions = readdirSync(join(__dirname, '..', 'extensions'));
for (const ext of extensions) {
	require(join(__dirname, '..', 'extensions', ext));
}

module.exports = DaydreamClient;
