const { MessageEmbed } = require('discord.js');
const defaultColor = parseInt(process.env.DEFAULT_EMBED_COLOR, 10);
const limits = {
	title: 256,
	description: 2048,
	footer: 2048,
	author: 256,
	fields: 25,
	fieldName: 256,
	fieldValue: 1024
};

class DaydreamEmbed extends MessageEmbed {
	constructor(data = {}) {
		super(data);
		this.color = data.color || defaultColor;
	}

	/**
	 * Applies spacing to every embed field but the last
	 * @returns {DaydreamEmbed}
	 */
	applySpacers() {
		for (const i in this.fields) {
			if (i < this.fields.length - 1) this.fields[i].value += `\n\u200B`;
		}
		return this;
	}

	shorten() {
		if (this.fields.length > limits.fields) {
			this.fields = this.fields.slice(0, limits.fields);
		}
		if (this.author && this.author.name.length > limits.author) {
			this.author.name = `${this.author.name.slice(0, limits.author - 3)}...`;
		}
		if (this.footer && this.footer.text.length > limits.footer) {
			this.footer.text = `${this.footer.text.slice(0, limits.footer - 3)}...`;
		}
		for (let i = 0; i < this.fields.length; i++) {
			const field = this.fields[i];
			if (field.name.length > limits.fieldName) {
				field.name = `${field.name.slice(0, limits.fieldName - 3)}...`;
			}
			if (field.value.length > limits.fieldValue) {
				field.value = `${field.value.slice(0, limits.fieldValue - 3)}...`;
			}
		}
		for (const key in this) {
			if (this.hasOwnProperty(key)) {
				if (limits[key] && this[key] && this[key].length > limits[key]) {
					this[key] = `${this[key].slice(0, limits[key] - 3)}...`;
				}
			}
		}
		return this;
	}
}

module.exports = DaydreamEmbed;
