// "Iowa" - Slipknot tribute with real guitar samples and voice
// Drop B, triple percussion, speech samples, gm_distortion_guitar
// setcps(0.75)

samples("shabda/speech:die,chaos,burn,psycho")
setcps(0.75)
stack(
  sound("bd [bd bd] [~ bd] bd [bd bd] bd [bd bd] sd").bank("RolandTR909").gain(1).speed(0.85),
  sound("bd bd bd bd bd bd bd bd").gain(0.3).speed(2).cutoff(350),
  sound("~ ~ sd ~ ~ [sd ~] sd [sd sd]").bank("RolandTR909").gain(0.75),
  sound("[hh hh] [hh hh] [oh hh] [hh hh] [hh hh] [hh hh] [oh hh] [hh hh hh]").bank("RolandTR909").gain(0.3).cutoff(8000).jux(rev),
  note("b1 b1 [b1 b1 b1 b1] b1 a1 a1 [b1 b1] [g#1 a1]").sound("gm_distortion_guitar").gain(0.55).lpf(2500).clip(0.2),
  note("b2 b2 [b2 b2 b2 b2] b2 a2 a2 [b2 b2] [g#2 a2]").sound("gm_overdriven_guitar").gain(0.45).lpf(3500).clip(0.15),
  note("[b3 f#4] [b3 f#4] [b3 f#4 b3 f#4] [b3 f#4] [a3 e4] [a3 e4] [g#3 d#4] [a3 e4]").sound("gm_distortion_guitar").gain(0.4).lpf(4000),
  note("b0 b0 [b0 b0 b0 b0] b0 a0 a0 [b0 b0] [g#0 a0]").sound("square").lpf(180).gain(0.5).fm(3),
  note("[f#5 b5] [a5 f#5] [e5 f#5 g#5 a5] [b5 ~] [a5 g#5] [f#5 e5] [f#5 ~] [e5 d#5]").sound("gm_distortion_guitar").gain(0.35).room(0.2).delay(0.1),
  s("<die psycho chaos burn>").slow(2).speed("<0.5 -1.2 1.4 -0.6>").gain(0.4).chop(16).often(x => x.speed(rand.range(-2,2))),
  sound("white").struct("~ ~ ~ t ~ ~ [t t] ~").gain(0.15).decay(0.02).sustain(0)
).compressor("-10:28:10:.001:.02").postgain(1.4)
