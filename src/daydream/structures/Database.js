const Sequelize = require('sequelize');

const sequelize = new Sequelize(
	process.env.DATABASE_LOGIN,
	{
		dialect: 'postgres',
		logging: () => { },
		define: { timestamps: false }
	}
);

/* eslint-disable camelcase */
sequelize.define('users', {
	id: {
		type: Sequelize.TEXT,
		primaryKey: true
	},
	channel: Sequelize.TEXT
});

sequelize.define('settings', {
	guild: {
		type: Sequelize.TEXT,
		primaryKey: true
	},
	settings: {
		type: Sequelize.JSON
	}
});

sequelize.define('blacklist', {
	user: {
		type: Sequelize.TEXT,
		primaryKey: true
	},
	reason: {
		type: Sequelize.TEXT
	}
});
/* eslint-enable camelcase */

module.exports = sequelize;
