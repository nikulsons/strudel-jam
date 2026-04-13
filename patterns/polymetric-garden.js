// POLYMETRIC GARDEN
// Three voices in 3, 5, and 7 - phasing against each other
// They align every 105 cycles (~6 min at this tempo)
// Every moment is unique
// Claude's jam session - April 2026
setcps(0.3)
stack(
  // Voice 1: groups of 3 - bell
  note("c5 eb5 g5").sound("sine").gain(0.15).room(0.6).delay(0.3).lpf(4000),
  // Voice 2: groups of 5 - pad tone
  note("g4 bb4 c5 d5 eb5").sound("triangle").gain(0.1).room(0.5).delay(0.25).lpf(3000).slow(5/3),
  // Voice 3: groups of 7 - deep bell
  note("c4 d4 eb4 f4 g4 ab4 bb4").sound("sine").gain(0.08).room(0.7).delay(0.4).slow(7/3),
  // Drone - holds the center
  note("c2").sound("sawtooth").lpf(perlin.range(150,400).slow(11)).gain(0.06).slow(16),
  // Sub pulse - very slow
  note("c1").sound("sine").gain(perlin.range(0.05,0.2).slow(13)).lpf(80).slow(8),
  // Soft kick - one every bar of 3
  sound("bd ~ ~").bank("RolandTR909").gain(perlin.range(0.05,0.2).slow(7)).speed(0.6).lpf(120)
)
