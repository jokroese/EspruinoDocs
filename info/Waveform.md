<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Waveforms
========

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Waveform. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Peripheral,Peripherals,Analog,ADC,DAC,A2D,D2A,Built-In,Audio,Wave,Signal,Sound,Music

Espruino contains both [[Analog]] Inputs ([[ADC]]) and [[Analog Outputs]] ([[DAC]]). Functions such as `analogRead` and `analogWrite` can be called at around 1kHz (although with PWM you can get higher frequency outputs). While that's fast enough for control it isn't fast enough to play and record audio.

Instead, you can use the [Waveform Class](/Reference#Waveform) to play back or record waveforms.

**Note:** When dealing the large amounts of elements in Waveforms you'll start to notice Espruino's relatively slow execution speed. We'd recommend using `E.sum`, `E.variance`, `E.convolve` and `E.FFT` to work on large arrays wherever possible, and `Array.forEach` and `Array.map` to iterate over their elements.

**Waveforms can use up so much CPU that they make render Espruino unresponsive** if you create a *repeating* Waveform with a frequency that is too high (above 10kHz input or 20kHz output).


Input
-----

Record 128 x 8 bit samples from A0 and then print the result:

```
var w = new Waveform(128);
w.on("finish", function(buf) {
  for (var i in buf)
    console.log(buf[i]);
});
w.startInput(A0,2000,{repeat:false});
```

Do the same, but with 16 bit values:

```
var w = new Waveform(128, {bits:16});
w.on("finish", function(buf) {
  for (var i in buf)
    console.log(buf[i]);
});
w.startInput(A0,2000,{repeat:false});
```


Record Audio continuously (with a double buffer) and output a bar graph to the console depending on the variance of the audio signal:

```
var w = new Waveform(128,{doubleBuffer:true});
w.on("buffer", function(buf) {
  var l = buf.length;
  var v = E.variance(buf,E.sum(buf)/l)/l;
  console.log("------------------------------------------------------------".substr(0,v));
});
w.startInput(A0,2000,{repeat:true});
```

Type `w.stop()` to stop recording (or playback).

You can also use continuous recording plus the built-in FFT to
measure frequencies. The following code will record at 1024Hz,
perform an FFT once a second, and will report back the highest
frequency detected between 100 and 500 Hz.

```
var w = new Waveform(1024,{doubleBuffer:true,bits:16});
var a = new Uint16Array(1024);
w.on("buffer", function(buf) {
  a.set(buf);
  E.FFT(a);
  var m=0,n=-1;
  for (var i=100;i<500;i++)if(a[i]>n)n=a[m=i];
  console.log(m.toFixed(0)+"Hz @ "+n);
});
w.startInput(D2,1024,{repeat:true});
```

**Note:** The FFT will only work on 2^N sized buffers, and the index in
the buffer equals the frequency in Hz only because each buffer contains
exactly one second's worth of frequency data.


Output
-----

To output via PWM, and repeat for 4 seconds:

```JS
var w = new Waveform(128);
for (var i=0;i<128;i++) w.buffer[i] = 128+Math.sin(i*Math.PI/64)*127;
analogWrite(A0, 0.5, {freq:80000});  // Set up PWM with freq above human hearing
w.startOutput(A0, 4000, {repeat:true});
setTimeout(function() { w.stop(); }, 4000);
```

Or to output a sine wave to the DAC on A4 (on the [Original Espruino](/Original) - this is the only board with a DAC:

```JS
var w = new Waveform(256);
for (var i=0;i<256;i++) w.buffer[i] = 128+Math.sin(i*Math.PI/128)*127;
analogWrite(A4, 0.5);
w.startOutput(A4, 4000);
```

You may also want to output one signal on two pins (2v25+ needed) which allows you to attach
a speaker without any capacitor to remove DC bias. It also doubles the effective volume:

| Value (8 bit) | Single output | Double + | Double - |
|-----|----|----|----|
| 0   |   0 | 0  | 1  |
| 64  |0.25 | 0  | 0.5  |
| 128 | 0.5 | 0  | 0  |
| 192 |0.75 | 0.5| 0  |
| 255 |   0 | 1  | 0  |

```JS
// set up waveform with a sine wave
var w = new Waveform(256);
for (var i=0;i<256;i++) w.buffer[i] = 128+Math.sin(i*Math.PI/128)*127;
// analog out on both channels
analogWrite(H0, 0.5, {freq:80000});
analogWrite(H1, 0.5, {freq:80000});
// set up waveform on two pins
w.startOutput(H0, 4000, { pin_neg:H1, repeat:true });
```

You can even output synchronized waveforms on two outputs:

```JS
var w = new Waveform(128);
var w2 = new Waveform(128);
for (var i=0;i<128;i++) w.buffer[i] = 128+Math.sin(i*Math.PI/64)*127;
w2.buffer.set(w.buffer); // copy w's signal to w2

analogWrite(A4, 0.5, {freq:40000});
analogWrite(A5, 0.5, {freq:40000});
var t = getTime()+0.01; // start in 10ms
w.startOutput(A4, 4000, {repeat:true, time:t});
w2.startOutput(A5, 4000, {repeat:true, time:t});
```

You can output a Sound file that you define in-line, with data created using
the [[File Converter]] page (from a 4kHz RAW wave file):

```JS
var wave = atob("haezvL6+ua+ZX0pAOzpASGKbsLm+v7qwl1xJPTs6RE5/rLa+v7qxllpHPTo9Rl6asru/vLSdYEY+OT9Haqa1vr+4rHdIQTg/RWmlt76+tqJiRT06QlOStbvAt6dnRTw7Ql+itsC7tYpNQThAUJO0vr21kE4/OUFZobfAua1sQjs+S4m3vb2vcUI9PE+Pu7u+oV48Pj1srL28s3ZAPTxgpry9tHk/PjxnrL68qmA8PEePvLy5fUA9P3i4u7yEQj0+erm7uno+PUaTvb2rWTs8ZLS7u3Y+PFCkvb2KPz5Inby+hT89UKe9unM6PWi7uqtLP0Gdur5yPjmAusCJQThuuL+VRDlot8COQDpzvrt9N0OIxq1lL16px4xCOoLCr1wzZra+fDVPoceJPUOZxpM/QZTHk0BDmcaFOE6owm40Yr2vVDeFx5A5U7G6XzWAxpA4WLixTj2cwms0isZ9MnPEkjVqw5g3ZsOYN2nEkjVxx3s0fsdrN567TEy6nTdxxnY3orRDWsWCNJO9SFzFeTWisT1zyFtNwoI4rqM3jb1AccJPV8ZfUMVxQsFzQsFxRMNvSbivur2/vLSnek1GOjw6Rk+AqrS9vr60qnpNRTo7PUhdm6+8vcC1rX9PQjs6QUl2qbW+v7mwjVJEOztBTYKvt8C8tqJoREA4QUh9rbjAvLSXVkM6PENdnre9vradWkQ6PUNqqbfAurN/SUA5QlactcC7tIZKPjpCYae3wbiqZUI6PkyOt768r3JBPTxRlLq8vKNgPD4+aKq+vLR4Qj08WqO9vbV5QT47Zau8vqtiPT1Ehbq8uohEPT1ss7y9kUc9PGy0vLyJQj1AhLu8tGg7PVWqvL6HQT1GlL69nEc+QIy8vpdFPUSVvryJPT5Usrq3XD87h7u/iUE5Z7W/oEk6U6nBqFM2VKjDoU81Xq/DlEU4cru8fDdFjcikVzJmtMB2OEmbx5VDPInGo082fcKrVTR4wqxUNXvDqE45j8WWPEqmw3gyZr6rTjqNx4Q1X7ytSz+ew20ze8aON128qENOtrBNQKq2UD+nt09BqrRJR6+vQFe/lzdpxYEyjMJaQbKoOmfGeDWcuEZYw3g2orI/ZcVkP7SbNJG7RGjJYEvBgDiykjKdqTOXrDaDujqDuDqHtTaOsqnBu8G3sZdhSUE6Oz5JX5muub6/urKbYUk/OjtCTHeqs7+9vbGiZUk+OztFVI+vub++tqlySUE5PURalbS6wbm0jlRDOzpDVJC0usC5sH9KQjhARnWsuMC7s4xOQjhASHyxucG4q25DPTpEZaq2wrivbEY7PUNzrru+uZhUPzo/XKK5vruhWz87P1yivL26kk89PER9try+qWY8Pj1vr729rWg9PT91tby9nlM8PE6Xvby0bz09Qoa6vLl/Pz1Bhrq8tW88PkiXvb6jUjw9aLW7unY9PVCkvryKPz1Lo7u+hkA7U6m9unY6PmO5uq5PPz+Wu755Pzl3ucCTRDhltcCeSTdfscKWRThquL+IPD59wrVxMlCZyZhMNXK7umo1UqfEizxDk8iYRjuJxaFKOITGoko5h8eXQkGZxos4Uq6/bzFwwqNHP5bGejNowaVERae/YzSGx4Q0Z8GgPVe8qEVIsq5IRrCvR0iyrEFQt6U6YcOLNHXGdTSXvlBIuZ02c8dsOaewPmXFazusqjlzxFhHvIgznrI9dcdTVsRrP7qFNaqdM6OhM5GxNZGvNZWrMp2nqMK7wbawk11IQDo7QEljna+6vr+5sZZcSD47O0NOfay0v768sZ1gRz46PEVYlbC6v761pmxHQDk+RF+btbvBubKJUEM6PENYlrW7wLiueElBOUFJe663v7mwhUxCOkJMg7G4vrWmaEU/Pkhsq7S/tKlnSD1CSHqtuLm0kFNDP0Rko7W5tZlZREFFZKO2t7OKT0NCTYOytbegY0NFRnistbWjZERFSX2wtLSUVEVEW5yztKhrRkdNi7KzrXVHR02LsbKpakdIVZixspdVSEl2ra+scEhJXqGwrn1KSlqgrrB9TElhpK6qcElMcK2snVVNUZesrXJNS4CrroZQSnGorY9TS2ymrYpRTXWqqn9MU4KwoG9HZJixildNe6qja0ton6qBTlqRrolVVIusj1hUh6yPWVWJq4dUW5OpgFBnnqJvUHuojllckaZ1Unamj1lhmZ9pVYele1N2o4pXbqGPXGackl1lm5JdZ5uQW26di1p0oH5af590XY6XZGmahlx9nHBiko5ge5pwZZOKYYGWa2yWe2OMjGR/lGt0lHJskntpj4JoioNohodqhYZrhYRthYSFiYeHhYN+eXh6fH18fXx9fH18fXx9fH0=");
var w = new Waveform(wave.length);
w.buffer.set(wave);
analogWrite(A0, 0.5, {freq:40000});
w.startOutput(A0,4000);
```

From 2v25 onwards you can output a file directly from Storage (as long as your Storage is on-chip):

```JS
var f = require("Storage").read("sound.pcm");
var w = new Waveform(E.toArrayBuffer(f));
w.startOutput(H0,8000);
```

Or to output a 4kHz 8 bit unsigned sound file loaded from the SD card:

```JS
var wave = require("fs").readFile("sound.raw");
var w = new Waveform(wave.length);
w.buffer.set(wave);

analogWrite(A4, 0.5, {freq:40000});
w.startOutput(A4,4000);
```

It's not advisable to load files more than 8kB long in one go, as you will quickly start to fill up all of Espruino's available RAM.

However if you want to play longer files, you can use the double buffer and can then stream data directly off the SD card:

```JS
var f = E.openFile("music11025.raw","r");

var w = new Waveform(2048, {doubleBuffer:true});
// load first bits of sound file
w.buffer.set(f.read(w.buffer.length));
w.buffer2.set(f.read(w.buffer.length));
var fileBuf = f.read(w.buffer.length);
// when one buffer finishes playing, load the next one
w.on("buffer", function(buf) {
  buf.set(fileBuf);
  fileBuf = f.read(buf.length);
  if (fileBuf===undefined) w.stop(); // end of file
});
// start output
analogWrite(A4, 0.5, {freq:40000});
w.startOutput(A4,11025,{repeat:true});
```

In the example above, we use a third buffer: `fileBuf`. This helps to remove any glitches that might be caused by delays reading the file.


Creating Audio Files for Espruino
---------------------------------

### Audacity

* Install [Audacity](http://audacity.sourceforge.net/)
* Open it and open a sound file
* Down the bottom-left, change `Project Rate (Hz)` to 4000 or whatever your target playback rate is
* Click `Tracks` -> `Stereo Track to Mono` if the track is stereo
* Highlight the bit of sound you want to export
* Click `File` -> `Export Selection`
* Choose `Other Uncompressed files`
* Choose `Options` then `RAW (header-less)` and `Unsigned 8 bit PCM`
* And save to the SD card
* If you don't want to use an SD card, you can load small sound snippets (less than 8kB) directly into Espruino's memory using the [[File Converter]] page.

### FFMpeg

You can simply use the command:

```Bash
ffmpeg -y -i your_sound.mp3 -acodec pcm_u8 -f u8 -ac 1 -ar 4000 output.pcm
```

* `-ar 4000` is a 4kHz output rate
* adding `-t 00:00:08` will crop to 8 seconds
* adding `-ss 10` will start the audio at 8 seconds in

Using Waveforms
--------------

* APPEND_USES: Waveform
