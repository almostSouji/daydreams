const { Command } = require('discord-akairo');
const { TRIGGER_GSOR } = require('../../util/constants');

class GSORCommand extends Command {
	condition(message) {
		return TRIGGER_GSOR.TRIGGERS.some(phrase => message.content.toLowerCase().includes(phrase)) && message.guild && TRIGGER_GSOR.GUILDS.includes(message.guild.id);
	}

	exec(message) {
		return message.react(TRIGGER_GSOR.EMOJI).catch(() => {});
	}
}

module.exports = GSORCommand;
