// SEVEN - 7/8 groove in D dorian
// 3+2+2 grouping, modal harmony
// Claude's jam session - April 2026

// Movement 1 - D dorian, single melody
setcps(0.55)
stack(
  sound("bd ~ ~ bd ~ bd ~").bank("RolandTR909").gain(0.7),
  sound("~ ~ sd ~ ~ ~ sd").bank("RolandTR909").gain(0.6),
  sound("hh hh hh hh hh hh [hh oh]").bank("RolandTR909").gain(0.2).cutoff(perlin.range(4000,9000).slow(7)),
  note("d2 ~ ~ a1 ~ g1 ~").sound("sawtooth").lpf(perlin.range(250,700).slow(5)).gain(0.35).fm(0.6),
  note("d1 ~ ~ a0 ~ g0 ~").sound("sine").gain(0.25).lpf(100),
  note("<[d3,a3,e4] [c3,g3,d4] [bb2,f3,c4] [a2,e3,b3]>").sound("triangle").gain(perlin.range(0.06,0.12).slow(6)).room(0.5).delay(0.2).lpf(perlin.range(1500,4000).slow(8)).slow(2),
  note("d5 [e5 f5] g5 a5 [g5 f5] e5 d5").sound("triangle").gain(0.18).room(0.4).delay(0.15).lpf(5000),
  note("a5 ~ ~ ~ ~ ~ ~ ~ ~ ~ g5 ~ ~ ~ f5 ~ ~ ~ ~ ~ ~ e5 ~ ~ ~ ~ ~ ~ d5 ~ ~ ~ ~ ~").sound("sine").gain(0.09).room(0.65).delay(0.4)
)

// Movement 2 - harmony shifts, two voices
// Uncomment below, comment above:
/*
setcps(0.55)
stack(
  sound("bd ~ ~ bd ~ bd ~").bank("RolandTR909").gain(0.7),
  sound("~ ~ sd ~ ~ ~ sd").bank("RolandTR909").gain(0.6),
  sound("hh hh hh hh hh hh [hh oh]").bank("RolandTR909").gain(0.2).cutoff(perlin.range(4000,9000).slow(7)),
  note("<[d2 ~ ~ a1 ~ g1 ~] [c2 ~ ~ g1 ~ bb1 ~] [d2 ~ ~ a1 ~ g1 ~] [f2 ~ ~ c2 ~ eb2 ~]>").sound("sawtooth").lpf(perlin.range(250,800).slow(5)).gain(0.35).fm(0.6),
  note("<[d1 ~ ~ a0 ~ g0 ~] [c1 ~ ~ g0 ~ bb0 ~] [d1 ~ ~ a0 ~ g0 ~] [f1 ~ ~ c1 ~ eb1 ~]>").sound("sine").gain(0.25).lpf(100),
  note("<[d3,a3,e4] [c3,g3,bb3] [d3,a3,e4] [f3,c4,eb4]>").sound("triangle").gain(perlin.range(0.06,0.12).slow(6)).room(0.5).delay(0.2).lpf(perlin.range(1500,4000).slow(8)).slow(2),
  note("d5 [e5 f5] [g5 a5 g5] a5 [bb5 a5] [g5 f5 e5] d5").sound("triangle").gain(0.18).room(0.4).delay(0.15).lpf(5000),
  note("f5 [g5 a5] [bb5 c6 bb5] c6 [d6 c6] [bb5 a5 g5] f5").sound("sine").gain(0.1).room(0.5).delay(0.25),
  note("d3").sound("sine").gain(0.04).room(0.3).slow(8)
)
*/
