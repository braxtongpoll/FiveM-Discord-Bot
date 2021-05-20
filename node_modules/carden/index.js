'use strict';
const stringWidth = require('string-width');
const chalk = require('chalk');
const widestLine = require('widest-line');
const cliBoxes = require('cli-boxes');
const camelCase = require('camelcase');
const ansiAlign = require('ansi-align');
const termSize = require('term-size');

const getObject = detail => {
	let object;

	if (typeof detail === 'number') {
		object = {
			top: detail,
			right: detail * 3,
			bottom: detail,
			left: detail * 3
		};
	} else {
		object = {
			top: 0,
			right: 0,
			bottom: 0,
			left: 0,
			...detail
		};
	}

	return object;
};

const getBorderChars = borderStyle => {
	const sides = [
		'topLeft',
		'topRight',
		'bottomRight',
		'bottomLeft',
		'vertical',
		'horizontal'
	];

	let chararacters;

	if (borderStyle === 'none') {
		chararacters = {
			topLeft: '',
			topRight: '',
			bottomLeft: '',
			bottomRight: '',
			horizontal: '',
			vertical: ''
		};
	} else if (borderStyle === 'blank') {
		chararacters = {
			topLeft: ' ',
			topRight: ' ',
			bottomLeft: ' ',
			bottomRight: ' ',
			horizontal: ' ',
			vertical: ' '
		};
	} else if (typeof borderStyle === 'string') {
		chararacters = cliBoxes[borderStyle];

		if (!chararacters) {
			throw new TypeError(`Invalid border style: ${borderStyle}`);
		}
	} else {
		for (const side of sides) {
			if (!borderStyle[side] || typeof borderStyle[side] !== 'string') {
				throw new TypeError(`Invalid border style: ${side}`);
			}
		}

		chararacters = borderStyle;
	}

	return chararacters;
};

const isHex = color => color.match(/^#[0-f]{3}(?:[0-f]{3})?$/i);
const isColorValid = color => typeof color === 'string' && ((chalk[color]) || isHex(color));
const getColorFn = color => isHex(color) ? chalk.hex(color) : chalk[color];
const getBGColorFn = color => isHex(color) ? chalk.bgHex(color) : chalk[camelCase(['bg', color])];

module.exports = (headerText, text, options) => {
	options = {
		padding: 0,
		borderStyle: 'single',
		dimBorder: false,
		align: 'left',
		float: 'left',
		...options
	};

	if (options.borderColor && !isColorValid(options.borderColor)) {
		throw new Error(`${options.borderColor} is not a valid borderColor`);
	}

	if (options.backgroundColor && !isColorValid(options.backgroundColor)) {
		throw new Error(`${options.backgroundColor} is not a valid backgroundColor`);
	}

	if (options.header && options.header.borderColor && !isColorValid(options.header.borderColor)) {
		throw new Error(`${options.header.borderColor} is not a valid borderColor`);
	}

	if (options.content && options.content.borderColor && !isColorValid(options.content.borderColor)) {
		throw new Error(`${options.content.borderColor} is not a valid borderColor`);
	}

	if (options.header && options.header.backgroundColor && !isColorValid(options.header.backgroundColor)) {
		throw new Error(`${options.header.backgroundColor} is not a valid backgroundColor`);
	}

	if (options.content && options.content.backgroundColor && !isColorValid(options.content.backgroundColor)) {
		throw new Error(`${options.content.backgroundColor} is not a valid backgroundColor`);
	}

	const margin = getObject(options.margin);
	const contentChars = getBorderChars(options.content ? options.content.borderStyle || options.borderStyle : options.borderStyle);
	const contentPadding = getObject(options.content ? options.content.padding || options.padding : options.padding);
	const headerChars = getBorderChars(options.header ? options.header.borderStyle || options.borderStyle : options.borderStyle);
	const headerPadding = getObject(options.header ? options.header.padding || options.padding : options.padding);

	const colorizeHeaderBorder = x => {
		let ret;
		if (options.header && options.header.borderColor) {
			ret = getColorFn(options.header.borderColor)(x);
		} else if (options.borderColor) {
			ret = getColorFn(options.borderColor)(x);
		} else {
			ret = x;
		}

		return options.header ? options.header.dimBorder ? chalk.dim(ret) : ret : options.dimBorder ? chalk.dim(ret) : ret;
	};

	const colorizeBorder = x => {
		let ret;
		if (options.content && options.content.borderColor) {
			ret = getColorFn(options.content.borderColor)(x);
		} else if (options.borderColor) {
			ret = getColorFn(options.borderColor)(x);
		} else {
			ret = x;
		}

		return options.content ? options.content.dimBorder ? chalk.dim(ret) : ret : options.dimBorder ? chalk.dim(ret) : ret;
	};

	const colorizeHeader = x => {
		if (options.header && options.header.backgroundColor) {
			return getBGColorFn(options.header.backgroundColor)(x);
		}

		if (options.backgroundColor) {
			return getBGColorFn(options.backgroundColor)(x);
		}

		return x;
	};

	const colorizeContent = x => {
		if (options.content && options.content.backgroundColor) {
			return getBGColorFn(options.content.backgroundColor)(x);
		}

		if (options.backgroundColor) {
			return getBGColorFn(options.backgroundColor)(x);
		}

		return x;
	};

	let headerAlign;
	if (options.header && options.header.align) {
		headerAlign = options.header.align;
	} else {
		headerAlign = options.align;
	}

	headerText = ansiAlign(headerText, {align: headerAlign});

	let contentAlign;
	if (options.content && options.content.align) {
		contentAlign = options.content.align;
	} else {
		contentAlign = options.align;
	}

	text = ansiAlign(text, {align: contentAlign});

	const NL = '\n';
	const PAD = ' ';

	let headerLines = headerText.split(NL);
	let lines = text.split(NL);

	if (contentPadding.top > 0) {
		lines = new Array(contentPadding.top).fill('').concat(lines);
	}

	if (headerPadding.top > 0) {
		headerLines = new Array(headerPadding.top).fill('').concat(headerLines);
	}

	if (contentPadding.bottom > 0) {
		lines = lines.concat(new Array(contentPadding.bottom).fill(''));
	}

	if (headerPadding.bottom > 0) {
		headerLines = headerLines.concat(new Array(headerPadding.bottom).fill(''));
	}

	const {columns} = termSize();
	const contentWidth = widestLine(text) + contentPadding.left + contentPadding.right;
	const headerWidth = widestLine(headerText) + headerPadding.left + headerPadding.right;
	const widestWidth = contentWidth > headerWidth ? contentWidth : headerWidth;

	let marginLeft = PAD.repeat(margin.left);

	if (options.float === 'center') {
		const padWidth = Math.max((columns - widestWidth) / 2, 0);
		marginLeft = PAD.repeat(padWidth);
	} else if (options.float === 'right') {
		const padWidth = Math.max(columns - widestWidth - margin.right - 2, 0);
		marginLeft = PAD.repeat(padWidth);
	}

	const top = colorizeHeaderBorder(NL.repeat(margin.top) + marginLeft + headerChars.topLeft + headerChars.horizontal.repeat(widestWidth) + headerChars.topRight);
	const bottom = colorizeBorder(marginLeft + contentChars.bottomLeft + contentChars.horizontal.repeat(widestWidth) + contentChars.bottomRight + NL.repeat(margin.bottom));
	const headerSide = colorizeHeaderBorder(headerChars.vertical);
	const side = colorizeBorder(contentChars.vertical);

	const headerMiddle = headerLines.map(line => {
		const paddingRight = PAD.repeat(widestWidth - stringWidth(line) - headerPadding.left);
		return marginLeft + headerSide + colorizeHeader(PAD.repeat(headerPadding.left) + line + paddingRight) + headerSide;
	}).join(NL);

	const middle = lines.map(line => {
		const paddingRight = PAD.repeat(widestWidth - stringWidth(line) - contentPadding.left);
		return marginLeft + side + colorizeContent(PAD.repeat(contentPadding.left) + line + paddingRight) + side;
	}).join(NL);

	return top + NL + headerMiddle + NL + middle + NL + bottom;
};

module.exports._borderStyles = cliBoxes;
