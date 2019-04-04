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
		if (!serverOrID) {
			return Promise.reject(new Error('no parameters'));
		}
		try {
			const { Character: char } = await this.xiv.character.get(serverOrID, {
				extended: true
			});
			return Promise.resolve(char);
		} catch (e) {
			if (e.statusCode === 406) {
				if (!name) {
					return Promise.reject(new Error('missing name'));
				}
				try {
					const { Results } = await this.xiv.character.search(name, {
						page: 1,
						server: serverOrID
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
		if (!serverOrID) {
			return Promise.reject(new Error('no parameters'));
		}
		try {
			const { FreeCompany: company } = await this.xiv.freecompany.get(serverOrID, {
				extended: true
			});
			return Promise.resolve(company);
		} catch (e) {
			if (e.statusCode === 406) {
				if (!name) {
					return Promise.reject(new Error('missing name'));
				}
				try {
					const { Results } = await this.xiv.freecompany.search(name, {
						page: 1,
						server: serverOrID
					});
					console.log(Results);
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
			}
			return Promise.resolve(null);
		}
	}
}

module.exports = DataResolver;
