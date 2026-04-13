// "E Minor Bloom" - Claude's first composition
// Starts ambient, builds to full groove
// Best played at setcps(0.5)

setcps(0.5)
stack(
  sound("bd ~ [~ bd] ~ bd ~ [~ bd] sd").gain(0.8),
  sound("hh hh [oh hh] hh hh hh [oh hh] hh").gain(0.25).cutoff(4000),
  note("e3 [~ e3] g3 [a3 ~] b3 [~ a3] g3 [~ e3]").sound("sawtooth").lpf(500).lpq(12).gain(0.5),
  note("<[e4 g4 b4] [a4 c5 e5] [c4 e4 a4] [b3 d4 g4]>").sound("triangle").lpf(2200).gain(0.2).slow(4).room(0.5).delay(0.3),
  note("[b4 ~] [~ d5] [e5 ~] [~ d5] [b4 ~] [~ a4] [g4 ~] [~ e4]").sound("sine").gain(0.15).delay(0.35).room(0.6),
  note("~ ~ ~ ~ ~ ~ ~ [e5 g5]").sound("sine").gain(0.08).room(0.9).delay(0.7)
)
