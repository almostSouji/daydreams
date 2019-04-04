const { Guild, Collection } = require('discord.js'); // eslint-disable-line
const fetch = require('node-fetch');

module.exports = {
	/**
	 * Returns the first key in the provided object where the value satisfies the provided predicate
	 * @param {Object} object // Object to check on
	 * @param {Function} predicate // Function to check values against
	 * @returns {string} Key
	 */
	getKeyByValue(object, predicate) {
		return Object.keys(object).find(key => predicate(object[key]));
	},
	/**
	* Returns the status emoji for provided member, results in an alternative if the bot does not have emoji permissions
	* @param {client} client Bot client
	* @param {string} status Status to get the emoji or altternative for
	* @param {Guild} guild Guild to take permission information from
	* @returns {string} Emojistring
	*/
	displayStatus: (client, status, guild) => {
		if (guild && !guild.me.hasPermission('USE_EXTERNAL_EMOJIS')) {
			return `${status}:`;
		}
		return client.config.emojis[status];
	},

	/**
	* Titlecases provided string
	* @param {string} input string to title case
	* @returns {string} string in title case
	*/
	toTitleCase: input => input = input.replace(/(\w)(\w*\s?)/gi, (match, p1, p2) => p1.toUpperCase() + p2),

	/**
	* Groups an iterable into a collection based on the return value of provided function
	* @param {Collection} collection Collection to group
	* @param {Function} fn Function to group by
	* @returns {Collection} Grouped Collection
	*/
	groupBy: (collection, fn) => {
		const c = new Collection();
		for (const [key, val] of collection) {
			const group = fn(val);
			const existing = c.get(group);
			if (existing) existing.set(key, val);
			else c.set(group, new Collection([[key, val]]));
		}
		return c;
	},

	postHaste: async (code, lang = '') => {
		try {
			if (code.length > 400000) {
				return 'Document exceeds maximum length.';
			}
			const res = await fetch('https://paste.nomsy.net/documents', { method: 'POST', body: code });
			const { key, message } = await res.json();
			if (!key) {
				return message;
			}
			return `https://paste.nomsy.net/${key}${lang && `.${lang}`}`;
		} catch (err) {
			throw err;
		}
	}
};
