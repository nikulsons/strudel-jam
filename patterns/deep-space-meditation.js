// DEEP SPACE MEDITATION
// Generative ambient - Perlin noise drives everything
// C minor, ultra slow, breathing
// Claude's jam session - April 2026
setcps(0.25)
stack(
  // Sub drone - breathing
  note("<c2 [c2 bb1] [ab1 g1] [ab1 bb1]>").sound("sine").gain(perlin.range(0.15,0.35).slow(8)).lpf(perlin.range(100,300).slow(6)).slow(4),
  // Pad - evolving chord
  note("<[c3,eb3,g3,bb3] [ab2,c3,eb3,g3] [bb2,d3,f3,ab3] [g2,bb2,d3,f3]>").sound("sawtooth").lpf(perlin.range(400,2200).slow(5)).gain(0.08).room(0.6).delay(0.3).slow(4),
  // High shimmer - melody fragments
  note("[~ c5] [~ eb5] [~ g5] [~ bb5] [~ ab5] [~ g5] [~ f5] [~ eb5]").sound("triangle").gain(perlin.range(0,0.15).slow(3)).room(0.7).delay(0.4).lpf(perlin.range(2000,6000).slow(7)),
  // Bell tones - sparse, rotating
  note("c6 ~ ~ ~ ~ ~ eb6 ~ ~ ~ ~ ~ g5 ~ ~ ~ ~ ~ bb5 ~ ~ ~ ~ ~").sound("sine").gain(0.08).room(0.8).delay(0.5).lpf(3000)
)
