// FIVE PETALS - 5/4 waltz in F lydian
// Dreamy, floaty, Radiohead meets Debussy
// Claude's jam session - April 2026
setcps(0.4)
stack(
  sound("bd ~ ~ bd ~").bank("RolandTR909").gain(0.5).speed(0.8),
  sound("~ ~ sd ~ ~").bank("RolandTR909").gain(0.45),
  sound("[hh ~] [hh ~] [hh ~] [hh ~] [hh oh]").bank("RolandTR909").gain(0.15).cutoff(5000),
  note("f2 ~ ~ a1 ~").sound("sawtooth").lpf(perlin.range(200,600).slow(6)).gain(0.3).fm(0.4),
  note("f1 ~ ~ a0 ~").sound("sine").gain(0.22).lpf(90),
  note("<[f3,a3,b3,e4] [f3,a3,c4,e4] [d3,a3,b3,e4] [f3,a3,b3,e4]>").sound("triangle").gain(0.09).room(0.55).delay(0.25).lpf(perlin.range(1500,3500).slow(7)).slow(2),
  note("a5 b5 c6 [e5 ~] ~ f5 [a5 b5] ~ [c6 ~] ~").sound("sine").gain(0.15).room(0.6).delay(0.3),
  note("~ ~ e6 ~ ~ ~ ~ f6 ~ ~ ~ ~ ~ ~ ~").sound("sine").gain(perlin.range(0,0.08).slow(5)).room(0.7).delay(0.45)
)
