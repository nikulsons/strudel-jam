// "Final Form" - The heaviest thing Strudel can produce
// Drop A, chromatic riff, 3 speech sample layers, guitar solo with echoWith in 7ths
// Compressor crushed at -6dB, postgain 1.6
// setcps(0.85)

samples("shabda/speech:destroy,fire,rage,war,death,scream,break,pain")
setcps(0.85)
stack(
  sound("bd [bd bd] [bd bd] bd [bd bd] bd [bd bd] sd").bank("RolandTR909").gain(1).speed(0.8),
  sound("bd bd bd bd bd bd bd bd").gain(0.45).speed(2.5).cutoff(300),
  sound("~ [sd sd] sd [sd sd] ~ [sd sd] sd [sd sd sd sd]").bank("RolandTR909").gain(0.9).speed(1.5),
  sound("[hh hh hh] [hh hh hh] [oh hh hh] [hh hh hh hh]").bank("RolandTR909").gain(0.35).cutoff(10000).jux(rev),
  sound("sd sd sd sd").fast(4).gain(0.1).speed("1 1.5 2 2.5 1.2 1.7 2.2 2.7 1.4 1.9 2.4 2.9 1.1 1.6 2.1 2.6").cutoff(600).degradeBy(0.5),
  note("a1 a1 [a1 a1 a1 a1] [g1 a1] f#1 [f#1 f#1 f#1 f#1] [g1 a1] [e1 f#1]").sound("gm_distortion_guitar").gain(0.65).lpf(3000).clip(0.12),
  note("a2 a2 [a2 a2 a2 a2] [g2 a2] f#2 [f#2 f#2 f#2 f#2] [g2 a2] [e2 f#2]").sound("gm_overdriven_guitar").gain(0.5).lpf(4000),
  note("[a3 e4] [a3 e4] [a3 e4 a3 e4] [g3 d4] [f#3 c#4] [f#3 c#4 f#3 c#4] [g3 d4] [e3 b3]").sound("gm_distortion_guitar").gain(0.42).lpf(5000),
  note("a0 a0 [a0 a0 a0 a0] [g0 a0] f#0 [f#0 f#0 f#0 f#0] [g0 a0] [e0 f#0]").sound("square").lpf(200).gain(0.7).fm(5).fmh("<1 2>"),
  note("[e5 a5] [g5 e5] [a5 b5 c6 b5] [a5 g5] [f#5 e5] [d5 e5 f#5 g5] [a5 b5] [c6 a5]").sound("gm_distortion_guitar").gain(0.38).echoWith(4, 1/16, (p,n) => p.add(n*7).gain(0.38/(n+1))),
  note("<a4 e4 g4 c5>").sound("sawtooth").vowel("<a e i o>").lpf(5000).gain(0.2).room(0.08),
  s("<destroy fire rage war>").slow(1).speed(rand.range(-2.5,2.5)).gain(0.55).chop(32),
  s("<death scream break pain>").slow(1.5).speed(rand.range(-2,2)).gain(0.45).chop(16).room(0.15),
  sound("white").struct("t ~ t ~ [t t] ~ [t t t] t").gain(0.22).decay(0.02).sustain(0),
  s("crackle*16").density(perlin.range(0.3,0.8)).gain(0.07)
).compressor("-6:30:10:.001:.01").postgain(1.6)
