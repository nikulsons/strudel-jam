// "Kitchen Sink LP" - Everything Strudel can throw at you
// TR-909 drums, FM bass, supersaw chords, Perlin warble, echo harmonics
// Sliders on everything. Pianoroll viz. For Chester.

setcps(0.6)
stack(
  sound("bd [bd ~] [~ bd] bd ~ bd [bd ~] sd").bank("RolandTR909").gain(slider(0.9, 0, 1, 0.01)),
  sound("~ ~ sd ~ ~ [sd ~] sd ~").bank("RolandTR909").gain(0.6).room(0.1),
  sound("hh*<8 6 8 10>").bank("RolandTR909").gain(perlin.range(0.15,0.35)).cutoff(perlin.range(3000,8000)).pan(perlin.range(0.3,0.7)).jux(rev),
  sound("oh ~ ~ ~ oh ~ ~ ~").bank("RolandTR909").gain(0.3).cut(1),
  note("c2 c2 [c2 c2] c2 ab1 ab1 bb1 [bb1 c2]").sound("square").lpf(slider(250, 80, 600, 10)).gain(0.55).fm(slider(1, 0, 8, 0.5)).fmh(slider(1, 0.5, 4, 0.1)),
  note("c3 c3 [c3 c3] c3 ab2 ab2 bb2 [bb2 c3]").sound("sawtooth").lpf(perlin.range(400,1200)).lpq(slider(8, 0, 25, 1)).lpenv(slider(3, 0, 8, 0.5)).lpdecay(perlin.range(0.05,0.3)).gain(0.35),
  note("[c4 g4] [c4 g4] [c4 g4] [c4 g4] [ab3 eb4] [ab3 eb4] [bb3 f4] [bb3 f4]").sound("supersaw").spread(0.7).detune(slider(0.3, 0, 1, 0.05)).unison(slider(5, 1, 9, 1)).lpf(slider(2000, 500, 6000, 100)).gain(slider(0.2, 0, 0.4, 0.01)),
  note("[eb5 ~] [d5 eb5] [c5 d5] [~ g4] [ab4 ~] [g4 ab4] [bb4 c5] [~ d5]").sound("sine").gain(0.22).room(slider(0.3, 0, 1, 0.05)).delay(slider(0.15, 0, 0.8, 0.05)).vib(slider(2, 0, 12, 0.5)).vibmod(slider(0.5, 0, 4, 0.1)).add(note(perlin.range(0,0.5))),
  note("c5 ~ eb5 ~ ab4 ~ bb4 c5").sound("triangle").gain(0.12).off(1/16, x=>x.add(note(7)).gain(0.06)).room(0.5),
  note("<c6 eb6 g6>").sound("sine").gain(slider(0.05, 0, 0.15, 0.01)).slow(4).room(0.95).delay(0.8)
)._pianoroll({labels:1, active:"#ff3366", inactive:"#1a1a2e"})
