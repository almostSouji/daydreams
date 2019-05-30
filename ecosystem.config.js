module.exports = {
	/**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
	apps: [
		{
			name: 'cai',
			script: './src/cai/bot.js',
			cwd: './src/cai'
		},
		{
			name: 'cel',
			script: './src/cel/bot.js',
			cwd: './src/cel'
		},
		{
			name: 'xiv',
			script: './src/xiv/bot.js',
			cwd: './src/xiv'
		}
	]
};
