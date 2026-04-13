// "Balkan 7" - 7/8 in D Phrygian
// 3+2+2 grouping, ornamental melody, Balkan brass energy
// Best at setcps(0.6)

setcps(0.6)
stack(
  sound("bd ~ bd ~ bd ~ ~").gain(0.9),
  sound("~ ~ ~ sd ~ ~ sd").gain(0.55).room(0.2),
  sound("hh [hh hh] hh hh [hh hh] hh hh").gain(0.25).cutoff(4500),
  sound("~ ~ ~ ~ ~ [oh ~] ~").gain(0.3).cutoff(2000),
  note("d3 [~ d3] [eb3 d3] [~ c3] c3 [bb2 ~] [a2 bb2]").sound("sawtooth").lpf(450).lpq(14).gain(0.5),
  note("[d4 ~ f4] [~ eb4 d4] [f4 ~ g4] [~ f4 ~] [eb4 ~ d4] [~ c4 eb4] [d4 ~ ~]").sound("triangle").lpf(2000).gain(0.25).room(0.35),
  note("[a4 bb4] ~ ~ [d5 c5] ~ [bb4 a4] ~").sound("sine").gain(0.16).delay(0.25).room(0.5),
  note("~ ~ ~ ~ [d5 eb5 f5] ~ ~").sound("square").lpf(1500).gain(0.08).room(0.7)
)
