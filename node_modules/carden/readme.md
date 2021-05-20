# carden [![Build Status](https://travis-ci.org/MrTarantula/carden.svg?branch=master)](https://travis-ci.org/MrTarantula/carden.svg?branch=master)

> Create cards in the terminal. Forked from [sindresorhus/boxen](https://github.com/sindresorhus/boxen). Options are the same, but can be configured independently for the header or content.

![screenshot](media/screenshot.png)

## Install

```bash
$ npm install carden
```

## Usage

```js
const carden = require('carden');

console.log(carden('unicorn', 'unicorn', {padding: 1}));
/*
┌─────────────┐
│             │
│   unicorn   │
│             │
│             │
│   unicorn   │
│             │
└─────────────┘
*/

console.log(carden('unicorn', 'unicorn', {padding: 1, margin: 1, borderStyle: 'double'}));
/*
   ╔═════════════╗
   ║             ║
   ║   unicorn   ║
   ║             ║
   ║             ║
   ║   unicorn   ║
   ║             ║
   ╚═════════════╝
*/
```

## API

### carden(header, content, [options])

#### header

Type: `string`

Text inside the header area.

#### content

Type: `string`

Text inside the content area.

#### options

Type: `object`

The same options object used for `boxen`, but the header and content can also be configured with their own `options` object.

## Examples

```js
// card with blue background for header
console.log(carden('Chidi',
  'You put the Peeps in the chili \npot and it makes it taste bad.', {
  header: {
    backgroundColor: 'blue'
  }
}));
```

![Chidi card](media/chidi.png)

```js
// card with different padding, border colors, and border styles
console.log(carden('Tahani',
  `It's not about who you know. Enlightenment comes from within.

The Dalai Lama texted me that.`, {
  margin: 2, // margin can only be set globally
  header: {
    backgroundColor: 'blue',
    padding: 1
  },
  content: {
    borderStyle: 'classic',
    borderColor: 'yellow'
  }
}));
```

![Tahani card](media/tahani.png)

```js
// card with green double border all around
console.log(carden('Eleanor',
  `That Eleanor is a better Eleanor than this one. And
that is not easy for me to say.

"You're not better than me" was my yearbook quote.`, {
  borderStyle: 'double',
  borderColor: 'green',
  header: {
    backgroundColor: 'blue',
    padding: 1
  }
}));
```

![Eleanor card](media/eleanor.png)

```js
// very customized card
console.log(carden('Jason',
  chalk.black(`I always trust dudes in bow ties. Once, this guy
in a bow tie came up to me at the gun range in a
Jacksonville bus station and said he'd give me
$600 if I put these weird turtles in my duffle
bag and brought them to Daytona Beach.

So I hotwired a swamp boat to Daytona and the guy
paid me the $600. My point is, you always trust
dudes in bow ties.`), {
  padding: 1,
  header: {
    backgroundColor: 'blue',
    borderStyle: 'classic',
    borderColor: 'cyan',
  },
  content: {
    backgroundColor: 'white',
    borderStyle: 'round',
    borderColor: 'yellow'
  }
}));
```

![Jason card](media/jason.png)

## Borders

Borders are the same as [sindresorhus/cli-boxes](https://github.com/sindresorhus/cli-boxes), with two additions (subtractions?):

* `blank` - replaces border characters with spaces, so the card lines up with cards that have borders

* `none` - border is completely removed, no characters in its place

```js
// single
console.log(carden('Janet',
  `Is it an error to act unpredictably and behave in
ways that run counter to how you were programmed
to behave?`, {
  borderStyle: 'single',
  padding: 1,
  header: {
    backgroundColor: 'green'
  },
  content: {
    backgroundColor: 'blue'
  }
}));

// blank
console.log(carden('Janet',
  `Is it an error to act unpredictably and behave in
ways that run counter to how you were programmed
to behave?`, {
  borderStyle: 'blank',
  padding: 1,
  header: {
    backgroundColor: 'green'
 },
  content: {
    backgroundColor: 'blue'
  }
}));

// none
console.log(carden('Janet',
  `Is it an error to act unpredictably and behave in
ways that run counter to how you were programmed
to behave?`, {
  borderStyle: 'none',
  padding: 1,
  header: {
    backgroundColor: 'green'
  },
  content: {
    backgroundColor: 'blue'
  }
}));
```

![Janet](media/janet.png)
