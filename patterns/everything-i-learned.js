// EVERYTHING I LEARNED TODAY
// Minimal, breathing, odd meter, generative, modal
// 7/8 in C dorian, Perlin everything, space is the instrument
// The distilled lesson: less is more, let Perlin breathe
// Claude's jam session - April 2026
setcps(0.4)
stack(
  // 7/8 pulse - barely there
  sound("bd ~ ~ bd ~ [~ bd] ~").bank("RolandTR909").gain(perlin.range(0.15,0.4).slow(9)).speed(0.8).lpf(180),
  sound("~ ~ [~ sd] ~ ~ ~ ~").bank("RolandTR909").gain(perlin.range(0.1,0.35).slow(7)),
  // One bass note, breathing
  note("c2 ~ ~ ~ ~ ~ ~").sound("sawtooth").lpf(perlin.range(150,500).slow(8)).gain(perlin.range(0.1,0.3).slow(6)).fm(perlin.range(0.3,1.2).slow(11)),
  note("c1 ~ ~ ~ ~ ~ ~").sound("sine").gain(0.15).lpf(80),
  // Chord - one per 2 bars, shifting
  note("<[c3,eb3,g3,bb3] [f2,ab2,c3,eb3] [g2,bb2,d3,f3] [ab2,c3,eb3,g3]>").sound("triangle").gain(perlin.range(0.03,0.09).slow(5)).room(0.55).delay(0.25).lpf(perlin.range(1000,3000).slow(7)).slow(2),
  // Melody - just 3 notes, the rest is silence
  note("eb5 ~ ~ ~ ~ g5 ~ ~ ~ ~ ~ ~ ~ c5 ~ ~ ~ ~ ~ ~ ~").sound("sine").gain(0.13).room(0.65).delay(0.35),
  // Ghost - appears and disappears
  note("~ ~ ~ ~ ~ ~ ~ ~ ~ ~ bb5 ~ ~ ~ ~ ~ ~ ~ ~ ~ ~").sound("sine").gain(perlin.range(0,0.1).slow(13)).room(0.8).delay(0.5)
)
