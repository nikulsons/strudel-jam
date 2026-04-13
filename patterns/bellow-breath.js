// BELLOW BREATH - for the accordion player
// Square wave = reed organ feel, Perlin = bellows breathing
// G major, folk ornaments
// Claude's jam session - April 2026
setcps(0.45)
stack(
  // "Bellows" - chords with breathing gain
  note("<[g3,b3,d4] [c3,e3,g3] [a2,c3,e3] [d3,f#3,a3]>").sound("square").gain(perlin.range(0.03,0.1).slow(3)).lpf(perlin.range(800,2500).slow(4)).room(0.3),
  // Right hand melody - ornamental, folk-like
  note("g4 [a4 b4] [c5 d5 c5] b4 a4 [g4 f#4] [g4 a4] [b4 ~]").sound("square").gain(0.12).lpf(perlin.range(1500,4000).slow(5)).room(0.25),
  // Bass buttons - left hand
  note("g2 ~ d2 ~ c2 ~ d2 ~").sound("square").gain(0.15).lpf(perlin.range(300,800).slow(6)),
  note("g1 ~ d1 ~ c1 ~ d1 ~").sound("sine").gain(0.12).lpf(150),
  // Foot tap
  sound("bd ~ ~ ~ bd ~ ~ ~").bank("RolandTR909").gain(0.3).speed(0.7).lpf(200),
  // Harmony voice - third above, fading in and out
  note("b4 [c5 d5] [e5 ~ e5] d5 c5 [b4 a4] [b4 c5] [d5 ~]").sound("square").gain(perlin.range(0,0.08).slow(4)).lpf(3000).room(0.3)
)
