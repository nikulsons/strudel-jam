// "Generative Garden" - C minor, never repeats
// Perlin noise on filters and volumes, shifting densities
// Best at setcps(0.45)

setcps(0.45)
stack(
  sound("bd*<3 4 2 5>").gain(0.75).sometimes(x => x.delay(0.15)),
  sound("sd").struct("~ [t ~] ~ t").gain(0.4).sometimes(x => x.room(0.7)),
  sound("hh*<8 6 8 10>").gain(perlin.range(0.1,0.3)).cutoff(perlin.range(2000,6000)),
  sound("oh").struct("~ ~ ~ ~ ~ [t ~] ~ ~").gain(0.25),
  note("c3 eb3 g3 bb3 ab3 f3 g3 eb3").sound("sawtooth").lpf(perlin.range(200,700)).lpq(14).gain(0.45).sometimes(x => x.ply(2)),
  note("c4 eb4 g4 bb4 ab4 f4").sound("triangle").struct("t ~ [t ~] ~ t ~ [~ t] t").lpf(perlin.range(800,3500)).gain(0.2).room(0.5).delay(0.35),
  note("c5 eb5 g5 bb5").sound("sine").struct("~ t ~ ~ t ~ ~ [t ~]").gain(perlin.range(0.05,0.18)).room(0.85).delay(0.55),
  note("<c6 eb6 g6 bb6>").sound("sine").gain(0.04).slow(8).room(0.95).delay(0.8)
)
