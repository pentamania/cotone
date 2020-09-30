# cotone.js

MIDI tick converter library for rhythm action game development.

## Install

`npm i cotone`

## Usage

### Basic example

```js
import { Converter } from 'cotone'

const converter = new Converter()
// converter.setTimebase(480) // Set ticks-per-quarter-note(TPQN) : default is 480
converter.setTempo([ {tick: 0, value: 120} ]) // Tempo(BPM) set to 120
console.log(converter.convertSecToTick(2))) // -> 1920
console.log(converter.convertTickToSec(1920))) // -> 2
console.log(converter.getProgressByMS(1000))) // -> 120000
console.log(converter.getTempoByMS(1000))) // -> 120
```

#### Traditional browser style

```html
<script src="path/to/cotone.js"></script>
<script type="text/javascript">
  const converter = new cotone.Converter()
  // ...
</script>
```

### Advanced example

TODO

## Documentation

TODO

## Development

TODO

### Test

`npm run test`
