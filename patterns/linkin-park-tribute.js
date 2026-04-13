// "For Chester" - Linkin Park inspired, full 4-minute structure
// Intro → Verse → Chorus → Verse 2 → Chorus 2 → Bridge → Final Chorus → Outro
// C minor, power chords, nu-metal energy meets electronic
// Created by Claude in Strudel Jam

// === INTRO (atmospheric, sparse) ===
// setcps(0.65)
// stack(
//   note("c3 ~ ~ ~ ~ ~ ~ ~").sound("sawtooth").lpf(200).lpq(20).gain(0.3),
//   note("<c4 eb4 g4>").sound("sine").gain(0.08).slow(8).room(0.9).delay(0.6),
//   sound("hh ~ ~ ~ hh ~ ~ ~").gain(0.1).cutoff(2000).room(0.5),
//   note("~ ~ ~ ~ ~ ~ ~ [g4 eb4]").sound("sine").gain(0.1).delay(0.5).room(0.8)
// )

// === VERSE 1 (stripped, melodic) ===
// setcps(0.65)
// stack(
//   sound("bd ~ ~ ~ bd ~ ~ ~").gain(0.8),
//   sound("~ ~ sd ~ ~ ~ sd ~").gain(0.45).room(0.4),
//   sound("hh ~ hh ~ hh ~ hh ~").gain(0.15).cutoff(3000),
//   note("c3 ~ ~ ~ eb3 ~ ~ ~").sound("sawtooth").lpf(400).gain(0.3),
//   note("<[c4 eb4 g4] [ab3 c4 eb4] [bb3 d4 f4] [g3 bb3 d4]>").sound("triangle").lpf(2000).gain(0.2).slow(4).room(0.6).delay(0.3),
//   note("g4 ~ [ab4 g4] ~ [eb5 ~] [d5 c5] ~ ~").sound("sine").gain(0.2).room(0.5).delay(0.25)
// )

// === CHORUS 1 (heavy, full power) ===
// setcps(0.65)
// stack(
//   sound("bd [bd ~] ~ bd ~ bd [bd ~] sd").gain(1),
//   sound("~ ~ sd ~ ~ ~ sd ~").gain(0.75).room(0.1),
//   sound("hh hh [oh hh] hh hh hh [oh hh] hh").gain(0.3).cutoff(5500),
//   note("c2 c2 c2 c2 ab1 ab1 bb1 bb1").sound("square").lpf(250).gain(0.6),
//   note("c3 c3 c3 c3 ab2 ab2 bb2 bb2").sound("sawtooth").lpf(900).lpq(5).gain(0.35),
//   note("[c4 g4] [c4 g4] [c4 g4] [c4 g4] [ab3 eb4] [ab3 eb4] [bb3 f4] [bb3 f4]").sound("square").lpf(1800).gain(0.28),
//   note("[eb5 ~] [~ d5] [c5 ~] [~ g4] [ab4 ~] [~ g4] [bb4 ~] [~ c5]").sound("sine").gain(0.22).room(0.3).delay(0.15)
// )

// === VERSE 2 (more rhythmic, electronic) ===
// setcps(0.65)
// stack(
//   sound("bd ~ [~ bd] ~ bd ~ [~ bd] ~").gain(0.8),
//   sound("~ ~ sd ~ ~ [~ sd] ~ ~").gain(0.5).room(0.3),
//   sound("hh hh hh hh hh hh hh hh").gain(0.2).cutoff(4000),
//   note("c3 [~ c3] ~ eb3 ~ [~ f3] eb3 ~").sound("sawtooth").lpf(450).lpq(10).gain(0.35),
//   note("<[c4 eb4 g4] [ab3 c4 eb4] [f3 ab3 c4] [g3 bb3 d4]>").sound("triangle").lpf(1800).gain(0.18).slow(4).room(0.5).delay(0.3),
//   note("[c5 ~] [~ bb4] [g4 ~] [~ ab4] [bb4 ~] [~ c5] [d5 ~] [~ c5]").sound("sine").gain(0.18).delay(0.2).room(0.4),
//   sound("bd sd").fast(4).gain(0.05).speed(2).cutoff(800)
// )

// === CHORUS 2 (heavier, extra layers) ===
// setcps(0.65)
// stack(
//   sound("bd [bd ~] ~ bd ~ bd [bd ~] sd").gain(1),
//   sound("~ ~ sd ~ ~ ~ sd sd").gain(0.8).room(0.1),
//   sound("hh hh [oh hh] hh hh hh [oh hh] [hh hh]").gain(0.32).cutoff(6000),
//   note("c2 c2 c2 c2 ab1 ab1 bb1 [bb1 c2]").sound("square").lpf(280).gain(0.65),
//   note("c3 c3 c3 c3 ab2 ab2 bb2 [bb2 c3]").sound("sawtooth").lpf(1000).lpq(5).gain(0.38),
//   note("[c4 g4] [c4 g4] [c4 g4] [c4 g4] [ab3 eb4] [ab3 eb4] [bb3 f4] [bb3 f4]").sound("square").lpf(2000).gain(0.3),
//   note("[eb5 ~] [d5 eb5] [c5 ~] [g4 ~] [ab4 ~] [g4 ab4] [bb4 ~] [c5 d5]").sound("sine").gain(0.24).room(0.3).delay(0.15),
//   note("c5 ~ ~ ~ ab4 ~ bb4 c5").sound("triangle").gain(0.15).room(0.4)
// )

// === BRIDGE (half-time breakdown) ===
// setcps(0.55)
// stack(
//   sound("bd ~ ~ ~ ~ ~ ~ ~").gain(0.9),
//   sound("~ ~ ~ ~ sd ~ ~ ~").gain(0.6).room(0.5),
//   note("ab2 ~ ~ ~ ~ ~ ~ ~").sound("square").lpf(200).gain(0.5),
//   note("<[ab3 c4 eb4] [eb3 g3 bb3] [f3 ab3 c4] [g3 bb3 d4]>").sound("triangle").lpf(1500).gain(0.22).slow(4).room(0.7).delay(0.4),
//   note("[eb5 ~] ~ ~ [d5 ~] ~ [c5 ~] ~ [bb4 c5]").sound("sine").gain(0.2).room(0.6).delay(0.35)
// )

// === FINAL CHORUS (climax, everything maxed) ===
setcps(0.7)
stack(
  sound("bd [bd ~] [~ bd] bd ~ bd [bd ~] sd").gain(1),
  sound("~ ~ sd ~ ~ [sd ~] sd ~").gain(0.8).room(0.1),
  sound("hh [hh hh] [oh hh] hh hh [hh hh] [oh hh] [hh hh]").gain(0.32).cutoff(6500),
  note("c2 c2 [c2 c2] c2 ab1 ab1 bb1 [bb1 c2]").sound("square").lpf(300).gain(0.7),
  note("c3 c3 [c3 c3] c3 ab2 ab2 bb2 [bb2 c3]").sound("sawtooth").lpf(1100).lpq(5).gain(0.4),
  note("[c4 g4] [c4 g4] [c4 g4] [c4 g4] [ab3 eb4] [ab3 eb4] [bb3 f4] [bb3 f4]").sound("square").lpf(2200).gain(0.32),
  note("[eb5 ~] [d5 eb5] [c5 d5] [~ g4] [ab4 ~] [g4 ab4] [bb4 c5] [~ d5]").sound("sine").gain(0.25).room(0.25).delay(0.12),
  note("c5 ~ eb5 ~ ab4 ~ bb4 c5").sound("triangle").gain(0.18).room(0.4),
  note("<c6 eb6 g6>").sound("sine").gain(0.06).slow(4).room(0.9).delay(0.7)
)

// === OUTRO (fade to single note) ===
// setcps(0.4)
// stack(
//   note("c4 ~ ~ ~ ~ ~ ~ ~").sound("sine").gain(0.08).room(0.95).delay(0.8)
// )
