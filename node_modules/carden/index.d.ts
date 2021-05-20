import { LiteralUnion } from 'type-fest';
import cliBoxes, { BoxStyle } from 'cli-boxes';

declare namespace carden {
	/**
	Characters used for custom border.

	@example
	```
	// affffb
	// e    e
	// dffffc

	const border: CustomBorderStyle = {
		topLeft: 'a',
		topRight: 'b',
		bottomRight: 'c',
		bottomLeft: 'd',
		vertical: 'e',
		horizontal: 'f'
	};
	```
	*/
	interface CustomBorderStyle extends BoxStyle { }

	/**
	Spacing used for `padding` and `margin`.
	*/
	interface Spacing {
		readonly top: number;
		readonly right: number;
		readonly bottom: number;
		readonly left: number;
	}

	interface Options {
		/**
		Color of the box border.
		*/
		readonly borderColor?: LiteralUnion<
			| 'black'
			| 'red'
			| 'green'
			| 'yellow'
			| 'blue'
			| 'magenta'
			| 'cyan'
			| 'white'
			| 'gray'
			| 'grey'
			| 'blackBright'
			| 'redBright'
			| 'greenBright'
			| 'yellowBright'
			| 'blueBright'
			| 'magentaBright'
			| 'cyanBright'
			| 'whiteBright',
			string
		>;

		/**
		Style of the box border.

		@default BorderStyle.Single
		*/
		readonly borderStyle?: BorderStyle | CustomBorderStyle;

		/**
		Reduce opacity of the border.

		@default false
		*/
		readonly dimBorder?: boolean;

		/**
		Space between the text and box border.

		@default 0
		*/
		readonly padding?: number | Spacing;

		/**
		Space around the box.

		@default 0
		*/
		readonly margin?: number | Spacing;

		/**
		Float the box on the available terminal screen space.

		@default 'left'
		*/
		readonly float?: 'left' | 'right' | 'center';

		/**
		Color of the background.
		*/
		readonly backgroundColor?: LiteralUnion<
			| 'black'
			| 'red'
			| 'green'
			| 'yellow'
			| 'blue'
			| 'magenta'
			| 'cyan'
			| 'white'
			| 'blackBright'
			| 'redBright'
			| 'greenBright'
			| 'yellowBright'
			| 'blueBright'
			| 'magentaBright'
			| 'cyanBright'
			| 'whiteBright',
			string
		>;

		/**
		Align the text in the box based on the widest line.

		@default 'left'
		*/
		readonly align?: 'left' | 'right' | 'center';
	}

	/**
 	* Options for entire card.
 	*/
	export interface CardenOptions extends Options {
		/**
		 * Options for card header only.
		 */
		header?: Options;

		/**
		 * Options for card content only.
		 */
		content?: Options;
	}
}

declare const enum BorderStyle {
	Single = 'single',
	Double = 'double',
	Round = 'round',
	Bold = 'bold',
	SingleDouble = 'singleDouble',
	DoubleSingle = 'doubleSingle',
	Classic = 'classic'
}

declare const carden: {
	/**
	Creates a card in the terminal.

	@param header - The text inside the card header.
	@param content - The text inside the card content area.
	@returns The card.

	@example
	```
	import carden = require('carden');

	console.log(carden('unicorn', 'unicorn', {padding: 1}));
	// ┌─────────────┐
	// │             │
	// │   unicorn   │
	// │             │
	// │             │
	// │   unicorn   │
	// │             │
	// └─────────────┘
	//


	console.log(carden('unicorn', 'unicorn', {padding: 1, margin: 1, borderStyle: 'double'}));
	//
	// ╔═════════════╗
	// ║             ║
	// ║   unicorn   ║
	// ║             ║
	// ║             ║
	// ║   unicorn   ║
	// ║             ║
	// ╚═════════════╝
	//
	```
	*/
	(header: string, content: string, options?: carden.CardenOptions): string;

	/**
	Border styles from [`cli-boxes`](https://github.com/sindresorhus/cli-boxes).
	*/
	BorderStyle: typeof BorderStyle;
};

export = carden;
