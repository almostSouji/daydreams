const DAYDREAM = require('../../daydream/util/constants');
const { stripIndents } = require('common-tags');

exports.suffixes = {

};
exports.DAYDREAM = DAYDREAM;
exports.MESSAGES = {
	COMMANDS: {
		BAN: {
			ERRORS: {
				SELF: `${DAYDREAM.PREFIXES.ERROR}Can not execute command on self.`,
				NOT_BANNABLE: `${DAYDREAM.PREFIXES.ERROR}Command execution denied.`,
				HIGHER_TARGET: `${DAYDREAM.PREFIXES.ERROR}Missing authorization.`,
				MODERATED: name => `${DAYDREAM.PREFIXES.ERROR}User \`${name}\` is currently being moderated.`,
				ALREADY_BANNED: name => `${DAYDREAM.PREFIXES.ERROR}User \`${name}\` is already banned.`,
				CANCELED: timeout => `${DAYDREAM.PREFIXES.ERROR}Action canceled${timeout ? ' (timeout)' : ''}.`
			},
			PROMPT: (moderator, soft, username) => `${moderator}, awaiting confirmation to ${soft ? 'soft' : ''}ban \`${username}\`. ${DAYDREAM.PROMPT_HELP}`,
			REASON: (moderator, reason) => `by ${moderator.tag} | ${moderator.id} | ${reason || 'no reason provided'}`,
			SUCCESS: {
				SOFT_BANNED: (target, guildname, reason, prune) => `${DAYDREAM.PREFIXES.SUCCESS}Softbanned \`${target} \`on  \`${guildname} \`${prune ? ' and removed their messages' : ''}${reason ? ` with reason  \`${reason} \`` : ''}.`,
				BANNED: (target, guildname, reason, prune) => `${DAYDREAM.PREFIXES.SUCCESS}Banned \`${target} \`on  \`${guildname} \`${prune ? ' and removed their messages' : ''}${reason ? ` with reason  \`${reason} \`` : ''}.`
			}
		},
		BAN_INFO: {
			ERRORS: {
				NO_TARGET: bansize => `${DAYDREAM.PREFIXES.ERROR}No target provided, please provide a valid user or ban number, number of bans: \`${bansize}\``,
				QUERY: (target, bansize) => `${DAYDREAM.PREFIXES.ERROR}Query unsuccessful: \`${target}\`, please provide a valid user or ban number, number of bans: \`${bansize}\``,
				CANCELED: error => `${DAYDREAM.PREFIXES.ERROR}Command canceled ${error ? `\`${error}\`` : ''}`
			},
			FETCHING: `Fetching information...`
		},
		EMOJI: {
			SUCCESS: {
				CLEAR: emojiname => `${DAYDREAM.PREFIXES.SUCCESS}Cleared reactions for \`:${emojiname}:\``,
				REMOVE: (emojiname, rolename) => `${DAYDREAM.PREFIXES.SUCCESS}Removed the role \`${rolename}\` from the emojiwhitelist of  \`:${emojiname}:\`.`,
				ADD: (emojiname, rolename) => `${DAYDREAM.PREFIXES.SUCCESS}Added the role \`${rolename}\` to the emojiwhitelist of  \`:${emojiname}:\`.`
			},
			ERROR: {
				INVALID: emoji => `${DAYDREAM.PREFIXES.ERROR}Invalid emoji \`${emoji}\``
			}

		},
		FORCE_ROLESTATE: {
			ERRORS: {
				INVALID_OPTION: `${DAYDREAM.PREFIXES.ERROR}Provide a valid option, either \`add\` or \`delete\`.`,
				INVALID_USER: `${DAYDREAM.PREFIXES.ERROR}Provide a valid user to force the rolestate update on.`,
				ROLES_ADD: `${DAYDREAM.PREFIXES.ERROR}Provide at least one valid role to add to the users rolestate.`,
				ROLES_REMOVE: `${DAYDREAM.PREFIXES.ERROR}Provide at least one valid role to remove from the users rolestate.`,
				ALL: targetname => `${DAYDREAM.PREFIXES.ERROR}All of the provided roles exist in the rolestate for \`${targetname}\``,
				NONE: targetname => `${DAYDREAM.PREFIXES.ERROR}None of the provided roles exist in the rolestate for \`${targetname}\``,
				CANCELED: timeout => `${DAYDREAM.PREFIXES.ERROR}Action canceled${timeout ? ' (timeout)' : ''}`
			},
			PROMPT: (targetname, option, validNames, invalidNames, isMember) => stripIndents`
				Are you sure you want to execute the following action on \`${targetname}\`'s rolestate?
				Chosen option: \`${option}\`
				Valid Role(s):\`${validNames}\`
				Invalid Role(s): \`${invalidNames}\`
				${isMember ? 'The target is a member of this server. Changing their roles will overwrite this action' : ''} (y/n)
				`,
			SUCCESS: {
				ADD: (user, roles) => `${DAYDREAM.PREFIXES.SUCCESS}Rolestate record for \`${user}\` and role(s) \`${roles}\` successfully created.`,
				REMOVE: (user, roles) => `${DAYDREAM.PREFIXES.SUCCESS}Rolestate record for \`${user}\` and role(s) \`${roles}\` successfully deleted.`
			}
		},
		KICK: {
			ERROS: {
				SELF: `${DAYDREAM.PREFIXES.ERROR}Can not execute command on self.`,
				NOT_BANNABLE: `${DAYDREAM.PREFIXES.ERROR}Command execution denied.`,
				HIGHER_TARGET: `${DAYDREAM.PREFIXES.ERROR}Missing authorization.`,
				MODERATED: name => `${DAYDREAM.PREFIXES.ERROR}User \`${name}\` is currently being moderated.`,
				CANCELED: timeout => `${DAYDREAM.PREFIXES.ERROR}Action canceled${timeout ? ' (timeout)' : ''}.`
			},
			PROMPT: (moderator, username) => `${moderator}, awaiting confirmation to kick ${username}. ${DAYDREAM.PROMPT_HELP}`,
			REASON: (moderator, reason) => `by ${moderator.tag} | ${moderator.id} | ${reason || 'no reason provided'}`,
			SUCCESS: (username, guildname, reason) => `${DAYDREAM.PREFIXES.SUCCESS}Kicked \`${username}\` from \`${guildname}\`${reason ? ` with reason \`${reason}\`` : ''}.`
		}
	}
};

