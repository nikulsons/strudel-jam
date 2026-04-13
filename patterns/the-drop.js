// "THE DROP" - Maximum intensity Linkin Park-inspired
// Breakdown → Build → Drop structure
// C0/C1 bass, triple saw layers, crushed compressor
// The hardest thing Strudel can do

// === THE DROP (play this one) ===
setcps(0.8)
stack(
  sound("bd [bd bd] [~ bd] bd [bd ~] bd [bd bd] sd").bank("RolandTR909").gain(1).speed(1.2),
  sound("~ [~ sd] sd ~ ~ [sd ~] sd [sd sd]").bank("RolandTR909").gain(0.9).room(0.05),
  sound("[hh hh] [hh hh] [oh hh] [hh hh] [hh hh] [hh hh] [oh hh] [hh hh hh]").bank("RolandTR909").gain(0.38).cutoff(8000).jux(rev),
  note("c1 c1 [c1 c1 c1 c1] c1 ab0 ab0 [bb0 bb0] [bb0 c1]").sound("square").lpf(200).gain(0.75).fm(3).fmh(1),
  note("c2 c2 [c2 c2 c2 c2] c2 ab1 ab1 [bb1 bb1] [bb1 c2]").sound("sawtooth").lpf(800).lpq(10).lpenv(5).lpdecay(0.06).gain(0.5).noise(0.2),
  note("c3 c3 [c3 c3 c3 c3] c3 ab2 ab2 [bb2 bb2] [bb2 c3]").sound("sawtooth").lpf(1500).gain(0.35),
  note("[c4 g4] [c4 g4] [c4 g4 c4 g4] [c4 g4] [ab3 eb4] [ab3 eb4] [bb3 f4 bb3 f4] [bb3 f4]").sound("supersaw").spread(1).detune(0.6).unison(9).lpf(4000).gain(0.35),
  note("[eb5 d5] [c5 eb5] [d5 c5 eb5 d5] [c5 g4] [ab4 g4] [ab4 bb4] [c5 bb4 c5 d5] [eb5 c5]").sound("square").lpf(5000).gain(0.22).room(0.1).echoWith(3, 1/16, (p,n) => p.add(n*3).gain(0.22/(n+1))),
  sound("bd sd").fast(8).gain(0.06).speed(3).cutoff(500),
  s("crackle*8").density(0.4).gain(0.05)
).compressor("-12:25:10:.001:.02").postgain(1.3)
