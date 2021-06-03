# cotone.js

MIDI tick converter library for rhythm action game development.

## About

Since timescale of music depends on it's tempo (BPM), music note data are usually managed by MIDI-tick unit instead of real-time in common music editing apps.

This library provides features for converting MIDI-tick <-> real-time, and also
utils for drawing notes in rhythm action game app (which has note-speed changing feature by tempo).

### Sample app

See following codesandbox project
https://codesandbox.io/s/cotone-sample-938j8

## Usage

### Install

```bash
npm install cotone
```

### Basic example

First, let's create an instance of key class, `Converter`.

```js
import { Converter } from 'cotone'

const converter = new Converter()
```

_Optional_  
The converting result depends on how you define the tick-unit value for quarter notes (This value is usually called "timebase", "ticks-per-quarter-note", "TPQN", etc.).
Default is set to `480`, but you can customize it with `setTimebase`

```js
converter.setTimebase(480)
```

Then, set the tempo using `setTempo`.

```js
// BPM: 128
converter.setTempo(128)
```

Now we're ready for conversion.  
Assume we have a note data like below.

```js
const noteTicks = [
  480, 960, 1920,
  // ... and so on
]
```

If you want real-time scale of these notes to schedule-play sounds, you can do like this.

```js
const sound = new Audio('path/to/mysound.wav')
const noteRealSeconds = noteTicks.map(tick => converter.convertTickToSec(tick))

noteRealSeconds.forEach(noteSec => {
  setTimeout(() => {
    sound.play()
  }, noteSec * 1000)
})
```

### Misc

##### Traditional browser style

```html
<script src="path/to/cotone.js"></script>
<script type="text/javascript">
  const converter = new cotone.Converter()
  // Same as above...
</script>
```

### Advanced

TODO

## Documentation

TODO

## Development

### Build

You should run `npm install` once to prepare building condition.

#### Dev

```bash
npm run dev
```

#### Production

```bash
npm run build
```

### Test

```bash
npm run test
```
