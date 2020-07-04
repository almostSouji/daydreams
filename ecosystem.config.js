module.exports = {
	/**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
	apps: [
		{
			name: 'cai',
			script: './bot.js',
			cwd: './src/cai'
		},
		{
			name: 'cel',
			script: './bot.js',
			cwd: './src/cel'
		},
		{
			name: 'xiv',
			script: './bot.js',
			cwd: './src/xiv'
		}
	]
};
