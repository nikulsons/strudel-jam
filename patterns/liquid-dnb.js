// LIQUID DnB - Deep Space to Dancefloor
// 170bpm, C minor, jazz voicings
// Claude's jam session - April 2026
setcps(1.4)
stack(
  // Smooth break
  sound("bd [~ bd] ~ bd [~ bd] ~ [bd ~] ~").bank("RolandTR909").gain(0.7).speed(1.05),
  sound("~ ~ sd ~ ~ [~ sd:1] ~ sd").bank("RolandTR909").gain(0.65),
  sound("[hh hh] [hh hh] [hh oh] [hh hh] [hh hh] [hh hh] [oh hh] [hh hh]").bank("RolandTR909").gain(0.2).cutoff(perlin.range(4000,8000).slow(5)),
  // Walking bass
  note("c2 ~ [eb2 ~] ~ g2 ~ [f2 ~] ~ eb2 ~ [d2 ~] ~ c2 ~ [bb1 ~] ~").sound("sawtooth").lpf(perlin.range(300,900).slow(4)).gain(0.35).fm(0.8),
  // Sub
  note("c1 ~ [eb1 ~] ~ g1 ~ [f1 ~] ~ eb1 ~ [d1 ~] ~ c1 ~ [bb0 ~] ~").sound("sine").gain(0.3).lpf(110),
  // Jazz chords - 9ths and 11ths
  note("<[c3,eb3,g3,bb3,d4] [ab2,c3,eb3,g3,bb3] [bb2,d3,f3,ab3,c4] [g2,bb2,d3,f3,ab3]>").sound("triangle").gain(0.1).room(0.5).delay(0.2).lpf(perlin.range(1500,4000).slow(6)).slow(2),
  // Rhodes stabs
  note("~ ~ ~ [c4,eb4,bb4] ~ ~ ~ ~ ~ ~ [ab3,c4,g4] ~ ~ ~ ~ ~").sound("sine").gain(0.12).room(0.5).delay(0.3),
  // Liquid melody with vowel
  note("c5 [eb5 g5] ~ [bb4 c5] eb5 [g5 f5] [eb5 d5] [c5 ~]").sound("triangle").vowel("<a e o a>").gain(0.15).room(0.45).delay(0.25).lpf(perlin.range(3000,7000).slow(4)),
  // High sparkle
  note("~ g6 ~ ~ ~ eb6 ~ ~ ~ c6 ~ ~ ~ bb5 ~ ~").sound("sine").gain(0.06).room(0.7).delay(0.4)
)
