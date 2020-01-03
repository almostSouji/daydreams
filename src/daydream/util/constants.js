exports.PREFIXES = {
	ERROR: '✘ ',
	SUCCESS: '✓ '
};

exports.SENSITIVE_PATTERN_REPLACEMENT = '[REDACTED]';

exports.WEATHER = {
	LANGUAGES: ['en', 'af', 'da', 'de', 'fr', 'fa', 'et', 'id', 'it', 'nb', 'nl', 'pl', 'pt-br', 'ro', 'ru', 'uk', 'az', 'be', 'bg', 'bs', 'ca', 'cy', 'cs', 'el', 'eo', 'es', 'fi', 'hi', 'hr', 'hu', 'hy', 'is', 'ja', 'jv', 'ka', 'kk', 'ko', 'ky', 'lt', 'lv', 'mk', 'ml', 'nl', 'nn', 'pt', 'pt-br', 'sk', 'sl', 'sr', 'sr-lat', 'sv', 'sw', 'th', 'tr', 'te', 'uz', 'vi', 'zh', 'zu', 'he'],
	LOCATION_EXAMPLE: 'Locations: Any location in any language (`munich`), airports (`MUC`), sights (`~statue of liberty`), moon phases (`moon`, `moon@2019-03-25`), GPS coordinates (`-78.46,106.79`).'
};

exports.DOCS = {
	DEV_VERSION: '11.5-dev',
	DEV_SOURCE: 'https://raw.githubusercontent.com/discordjs/discord.js/docs/11.5-dev.json',
	API: {
		BASE_URL: 'https://djsdocs.sorta.moe/v2/embed?',
		SOURCES: ['stable', 'master', 'rpc', 'commando', 'akairo', 'akairo-master', '11.5-dev']
	}
};

exports.HELP = {
	EMOJIS: {
		GRANTED: `\`✅\``,
		DENIED: `\`❌\``
	}
};

exports.XKCD = {
	BASE_URL: 'https://xkcd.com/',
	BASE_URL_EXPLAIN: 'https://www.explainxkcd.com/wiki/index.php/'
};

exports.PROMPT_ANSWERS = {
	GRANTED: ['y', 'yes'],
	DENIED: ['n', 'no']
};

exports.PROMPT_ANSWERS_ALL = this.PROMPT_ANSWERS.GRANTED.concat(this.PROMPT_ANSWERS.DENIED);
exports.PROMPT_HELP = `(${this.PROMPT_ANSWERS.GRANTED[0]}/${this.PROMPT_ANSWERS.DENIED[0]})`;

exports.MESSAGES = {
	ERRORS: {
		RESOLVE: (input, type) => `${this.PREFIXES.ERROR}Can not convert \`${input}\` to \`${type}\``,
		TARGET: type => `${this.PREFIXES.ERROR}Not target provided, please provide a valid ${type}`,
		CANCEL: `${this.PREFIXES.ERROR}Action cancelled.`,
		CANCEL_WITH_ERROR: error => `${this.PREFIXES.ERROR}Action cancelled. \`${error}\``,
		CATCH: `${this.PREFIXES.ERROR}Something went wrong.`
	},
	LOGGER: (prefix, input) => `${prefix} ${input}`,
	COMMANDS: {
		GUILD_INFO: {
			ROLESTATE: (resultLength, rolesSize, usersSize) => `Rolestate is enabled and has ${resultLength} records for this guild saving the state of ${rolesSize} roles across ${usersSize} users.`
		},
		USER_INFO: {
			INVITE_ME: 'Invite me to your server',
			CREATED_BY: username => `Coded with 🍵 by ${username}`,
			BLACKLIST_STATUS: {
				BLACKLISTED: reason => `${this.HELP.EMOJIS.DENIED} Blacklisted${reason ? ` with reason ${reason}` : ''}`,
				NOT_BLACKLISTED: `${this.HELP.EMOJIS.GRANTED} Not blacklisted`
			}
		},
		WEATHER: {
			ERRORS: {
				NO_DATA: location => `${this.ERROR}No weather data for location \`${location}\` found.\n${this.WEATHER.LOCATION_EXAMPLE}`,
				QUERIES: location => `${this.PREFIXES.ERROR}Error while retrieving data for \`${location}\`. Try again later`,
				MISSING_LOCATION: `${this.PREFIXES.ERROR}Please specify a location to retrieve data from.\n${this.WEATHER.LOCATION_EXAMPLE}`
			}
		},
		BLACKLIST: {
			PROMPT: (target, reason, result) => `Are you sure you want to ${result ? 'un' : ''}blacklist \`${target.tag}\` (${target.id})${!result && reason ? ` with reason: \`${reason}\`` : ''}?${result && result.reason ? ` They are blacklisted for the reason: \`${reason}\`.` : ''}`,
			SUCCESS: (unblacklist, target) => `${this.PREFIXES.SUCCESS}${unblacklist ? 'Unb' : 'B'}lacklisted \`${target.tag}\` (${target.id})`
		},
		EVAL: {
			LONG_OUTPUT: hastelink => `Output too long, uploading it to hastebin instead: ${hastelink}.`,
			INPUT: code => `Input:\`\`\`js\n${code}\n\`\`\``,
			OUTPUT: code => `Output:\`\`\`js\n${code}\n\`\`\``,
			TYPE: ``,
			TIME: ``,
			HASTEBIN: ``,
			ERRORS: {
				TOO_LONG: `${this.PREFIXES.ERROR}Output too long, failed to upload to hastebin as well.`,
				CODE_BLOCK: error => `${this.PREFIXES.ERROR}Error:\`\`\`xl\n${error}\n\`\`\``
			}
		},
		RELOAD: {
			ERRORS: {
				ALL: error => `${this.PREFIXES.ERROR}Could not reload commands: \`${error}\``,
				ONE: (input, type, error) => `${this.PREFIXES.ERROR}Could not reload ${type} \`${input}\`: \`${error}\``
			},
			SUCCESS: {
				ALL: `${this.PREFIXES.SUCCESS}Reloaded all commands and listeners.`,
				ONE: (input, type) => `${this.PREFIXES.SUCCESS}Reloaded ${type} \`${input}\``
			}
		},
		PREFIX: {
			DM: prefix => `You can use the standard prefix \`${prefix}\` in direct messages.`,
			CURRENT: prefix => `My prefix here is \`${prefix}\`.\nAlternatively you can mention me.`,
			RESET: (prefix, guildname) => `Prefix on \`${guildname}\` reset to \`${prefix}\`.`,
			CHANGE: (oldPrefix, newPrefix, guildname) => `Prefix on \`${guildname}\` changed from \`${oldPrefix}\` to \`${newPrefix}\`.`
		},
		DOCS: {
			ERRORS: {
				NOT_FOUND: `${this.PREFIXES.ERROR}Could not find requested content.`
			}
		},
		HELP: {
			OWNER_ONLY: granted => `${granted ? this.HELP.EMOJIS.GRANTED : this.HELP.EMOJIS.DENIED} Owner only`,
			GUILD_ONLY: granted => `${granted ? this.HELP.EMOJIS.GRANTED : this.HELP.EMOJIS.DENIED} Server only`,
			USER_PERMISSIONS: (granted, permissions) => `${granted ? this.HELP.EMOJIS.GRANTED : this.HELP.EMOJIS.DENIED} User permissions: ${permissions}`,
			BOT_PERMISSIONS: (granted, permissions) => `${granted ? this.HELP.EMOJIS.GRANTED : this.HELP.EMOJIS.DENIED} Bot permissions: ${permissions}`,
			AVAILABLE_COMMANDS_INTRO: 'Your available commands are:',
			MORE_INFORMATION: (prefix, commandname) => `You can use \`${prefix}${commandname} <commandname>\` to get more information about a command.
			`
		},
		PING: {
			WAITING: 'awaiting ping...',
			SUCCESS: (latency, heartbeat) => `${this.PREFIXES.SUCCESS} pong! Api latency is ${latency}ms. Av. heartbeat is ${heartbeat}`
		},
		QUOTE: {
			ERRORS: {
				MISSING_PERMISSIONS: `${this.PREFIXES.ERROR}You can only quote messages you have permission to view.`,
				NO_CONTENT: `${this.PREFIXES.ERROR}The target message does not have any content to quote.`
			},
			JUMP_LINK: url => `[➜](${url} 'jump to message')`
		},
		XKCD: {
			ERRORS: {
				NOT_FOUND: `${this.PREFIXES.ERROR}Xkcd not found.`,
				INVALID: number => `${this.PREFIXES.ERROR}Invalid xkcd: #${number}.`
			}
		}
	},
	LISTENERS: {
		COMMAND_BLOCKED: {
			GUILD_ONLY: commandname => `${this.PREFIXES.ERROR}The command \`${commandname}\` is not available in direct messages`
		},
		COOLDOWN: {
			TRY_AGAIN_IN: offset => `${this.PREFIXES.ERROR}Try again in ${offset}s.`
		},
		MESSAGE_INVALID: {
			ERRORS: {
				NO_CONNECTION: (verificationEmoji, username) => `${this.PREFIXES.ERROR}[${verificationEmoji}] Connection to \`${username}\` could not be established.`,
				NO_RECIPIENT: verificationEmoji => `${this.PREFIXES.ERROR}[${verificationEmoji}] Recipient not found`
			},
			TOPIC: (verificationEmoji, user) => `${verificationEmoji} DM with: ${user} | ${user.tag} (${user.id})`
		},
		MISSING_PERMISSIONS: {
			USER: (permissions, commandname) => `${this.PREFIXES.ERROR}You need the permission${permissions.length > 1 ? 's' : ''} ${permissions} to execute the command \`${commandname}\`.`,
			BOT: (permissions, commandname) => `${this.PREFIXES.ERROR}I need the permission${permissions.length > 1 ? 's' : ''} ${permissions} to execute the command \`${commandname}\`.`
		},
		LOGIN: {
			LOG: client => `Logged in as ${client.user.tag} (${client.user.id}).`
		},
		DISCONNECT: {
			LOG: code => `Disconnected with eventcode ${code}.`
		},
		RESUMED: {
			LOG: number => `Resumed (Replayed ${number} events).`
		}
	}
};
