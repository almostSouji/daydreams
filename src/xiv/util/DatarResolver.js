class DataResolver {
	/**
	* @param {XIVAPI} xiv The instance of XIVAPI to make requests with
	*/
	constructor(xiv) {
		this.xiv = xiv;
	}

	/**
	 * Resolves a character ID or server/name combination to a character object
	 * @param {string} serverOrID ID or server name to search on
	 * @param {string} [name] Character name, only needed if not using an ID
	 * @returns {Promise<Object>}
	 */
	async resolveCharacter(serverOrID, name) {
		const handleSearch = async (server, charname) => {
			if (!charname) {
				return Promise.reject(new Error('missing name'));
			}
			if (!this.xiv.resources.servers.find(s => s.toLowerCase() === server.toLowerCase())) {
				return Promise.reject(new Error('invalid server'));
			}
			try {
				const { Results } = await this.xiv.character.search(charname, {
					page: 1,
					server
				});
				if (!Results.length) {
					return Promise.resolve(null);
				}
				const { Character: char } = await this.xiv.character.get(Results[0].ID, {
					extended: true
				});
				return Promise.resolve(char);
			} catch (err) {
				if (err.statusCode === 406) {
					return Promise.reject(new Error('invalid arguments'));
				}
				return Promise.reject(err);
			}
		};

		if (!serverOrID) {
			return Promise.reject(new Error('no parameters'));
		}
		if (isNaN(serverOrID)) {
			return handleSearch(serverOrID, name);
		}
		try {
			if (isNaN(serverOrID)) {
				throw new Error({ message: 'invalid id', statusCode: 406 });
			}
			const { Character: char } = await this.xiv.character.get(serverOrID, {
				extended: true
			});
			return Promise.resolve(char);
		} catch (e) {
			if (e.statusCode === 406) {
				return handleSearch(serverOrID, name);
			}
			return Promise.resolve(null);
		}
	}

	/**
	 * Resolves a server ID or server/name combination to a server object
	 * @param {string} serverOrID ID or server name to search on
	 * @param {string} [name] Free Company name, only needed if not using an ID
	 * @returns {Promise<Object>}
	 */
	async resolveFreeCompany(serverOrID, name) {
		const handleSearch = async (server, fcname) => {
			if (!fcname) {
				return Promise.reject(new Error('missing name'));
			}
			if (!this.xiv.resources.servers.find(s => s.toLowerCase() === server.toLowerCase())) {
				return Promise.reject(new Error('invalid server'));
			}
			try {
				const { Results } = await this.xiv.freecompany.search(fcname, {
					page: 1,
					server
				});
				if (!Results.length) {
					return Promise.resolve(null);
				}
				const { FreeCompany: company } = await this.xiv.freecompany.get(Results[0].ID, {
					extended: true
				});
				return Promise.resolve(company);
			} catch (err) {
				if (err.statusCode === 406) {
					return Promise.reject(new Error('invalid arguments'));
				}
				return Promise.reject(err);
			}
		};
		if (!serverOrID) {
			return Promise.reject(new Error('no parameters'));
		}
		if (isNaN(serverOrID)) {
			return handleSearch(serverOrID, name);
		}
		try {
			const { FreeCompany: company } = await this.xiv.freecompany.get(serverOrID, {
				extended: true
			});
			return Promise.resolve(company);
		} catch (e) {
			if (e.statusCode === 406) {
				return handleSearch(serverOrID, name);
			}
			return Promise.resolve(null);
		}
	}
}

module.exports = DataResolver;
