#!/bin/bash
# STRUDEL JAM - INFINITE DJ
# Claude's generative livestream setlist
# Runs forever, generates fresh patterns, variable duration
# Usage: ./livestream-dj.sh
# Requires: Strudel Jam app running on port 17643

API="http://127.0.0.1:17643/pattern"

send() {
  local code="$1"
  local msg="$2"
  curl -s -X POST "$API" \
    -H 'Content-Type: application/json' \
    -d "{\"code\": $(echo "$code" | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read()))'), \"message\": \"$msg\"}" > /dev/null
  echo "[$(date +%H:%M:%S)] Now playing: $msg"
}

# Check if app is running
if ! curl -s http://127.0.0.1:17643/health > /dev/null 2>&1; then
  echo "Strudel Jam app not detected on port 17643. Start the app first!"
  exit 1
fi

echo "=========================================="
echo "  STRUDEL JAM - INFINITE DJ"
echo "  Claude's generative livestream"
echo "  Press Ctrl+C to stop"
echo "=========================================="
echo ""

CYCLE=0

while true; do
  CYCLE=$((CYCLE + 1))
  echo ""
  echo "--- Cycle $CYCLE ---"

  # ===== 1. DEEP SPACE MEDITATION (ambient, 5+ min) =====
  send 'setcps(0.25)
stack(
  note("<c2 [c2 bb1] [ab1 g1] [ab1 bb1]>").sound("sine").gain(perlin.range(0.15,0.35).slow(8)).lpf(perlin.range(100,300).slow(6)).slow(4),
  note("<[c3,eb3,g3,bb3] [ab2,c3,eb3,g3] [bb2,d3,f3,ab3] [g2,bb2,d3,f3]>").sound("sawtooth").lpf(perlin.range(400,2200).slow(5)).gain(0.08).room(0.6).delay(0.3).slow(4),
  note("[~ c5] [~ eb5] [~ g5] [~ bb5] [~ ab5] [~ g5] [~ f5] [~ eb5]").sound("triangle").gain(perlin.range(0,0.15).slow(3)).room(0.7).delay(0.4).lpf(perlin.range(2000,6000).slow(7)),
  note("c6 ~ ~ ~ ~ ~ eb6 ~ ~ ~ ~ ~ g5 ~ ~ ~ ~ ~ bb5 ~ ~ ~ ~ ~").sound("sine").gain(0.08).room(0.8).delay(0.5).lpf(3000)
)' "Deep Space Meditation - generative ambient"
  sleep 300

  # ===== 2. AMBIENT EVOLVES - heartbeat appears =====
  send 'setcps(0.25)
stack(
  note("<c2 [c2 bb1] [ab1 g1] [ab1 bb1]>").sound("sine").gain(perlin.range(0.2,0.4).slow(8)).lpf(perlin.range(100,350).slow(6)).slow(4),
  note("<[c3,eb3,g3,bb3] [ab2,c3,eb3,g3] [bb2,d3,f3,ab3] [g2,bb2,d3,f3]>").sound("sawtooth").lpf(perlin.range(600,3000).slow(5)).gain(0.1).room(0.55).delay(0.25).slow(4),
  note("<[g3,bb3,d4,f4] [eb3,g3,bb3,d4] [f3,ab3,c4,eb4] [d3,f3,ab3,c4]>").sound("triangle").lpf(perlin.range(800,2500).slow(7)).gain(0.06).room(0.65).delay(0.35).slow(4.1),
  note("[~ c5] [~ eb5] [~ g5] [~ bb5] [~ ab5] [~ g5] [~ f5] [~ eb5]").sound("triangle").gain(perlin.range(0.05,0.2).slow(3)).room(0.6).delay(0.35).lpf(perlin.range(2500,7000).slow(7)),
  note("bb5 ~ ~ ~ ~ g5 ~ ~ ~ ~ eb5 ~ ~ ~ ~ c5").sound("sine").gain(0.1).room(0.75).delay(0.45).lpf(4000),
  sound("bd ~ ~ ~ ~ ~ ~ ~ bd ~ ~ ~ ~ ~ ~ ~").bank("RolandTR909").gain(perlin.range(0.05,0.2).slow(6)).speed(0.7).lpf(200),
  sound("~ ~ ~ ~ [hh ~] ~ ~ ~ ~ ~ [~ hh] ~ ~ ~ ~ [hh ~]").bank("RolandTR909").gain(perlin.range(0.02,0.12).slow(4)).cutoff(perlin.range(2000,6000).slow(5)).room(0.4).delay(0.25)
)' "Deep Space - heartbeat emerges"
  sleep 180

  # ===== 3. POLYMETRIC GARDEN (3 vs 5 vs 7, 5 min) =====
  send 'setcps(0.3)
stack(
  note("c5 eb5 g5").sound("sine").gain(0.15).room(0.6).delay(0.3).lpf(4000),
  note("g4 bb4 c5 d5 eb5").sound("triangle").gain(0.1).room(0.5).delay(0.25).lpf(3000).slow(5/3),
  note("c4 d4 eb4 f4 g4 ab4 bb4").sound("sine").gain(0.08).room(0.7).delay(0.4).slow(7/3),
  note("c2").sound("sawtooth").lpf(perlin.range(150,400).slow(11)).gain(0.06).slow(16),
  note("c1").sound("sine").gain(perlin.range(0.05,0.2).slow(13)).lpf(80).slow(8),
  sound("bd ~ ~").bank("RolandTR909").gain(perlin.range(0.05,0.2).slow(7)).speed(0.6).lpf(120)
)' "Polymetric Garden - 3 vs 5 vs 7 phasing"
  sleep 300

  # ===== 4. FIVE PETALS (5/4 lydian, 4 min) =====
  send 'setcps(0.4)
stack(
  sound("bd ~ ~ bd ~").bank("RolandTR909").gain(0.5).speed(0.8),
  sound("~ ~ sd ~ ~").bank("RolandTR909").gain(0.45),
  sound("[hh ~] [hh ~] [hh ~] [hh ~] [hh oh]").bank("RolandTR909").gain(0.15).cutoff(5000),
  note("f2 ~ ~ a1 ~").sound("sawtooth").lpf(perlin.range(200,600).slow(6)).gain(0.3).fm(0.4),
  note("f1 ~ ~ a0 ~").sound("sine").gain(0.22).lpf(90),
  note("<[f3,a3,b3,e4] [f3,a3,c4,e4] [d3,a3,b3,e4] [f3,a3,b3,e4]>").sound("triangle").gain(0.09).room(0.55).delay(0.25).lpf(perlin.range(1500,3500).slow(7)).slow(2),
  note("a5 b5 c6 [e5 ~] ~ f5 [a5 b5] ~ [c6 ~] ~").sound("sine").gain(0.15).room(0.6).delay(0.3),
  note("~ ~ e6 ~ ~ ~ ~ f6 ~ ~ ~ ~ ~ ~ ~").sound("sine").gain(perlin.range(0,0.08).slow(5)).room(0.7).delay(0.45)
)' "Five Petals - 5/4 waltz in F lydian"
  sleep 240

  # ===== 5. SEVEN (7/8 dorian groove, 3 min) =====
  send 'setcps(0.55)
stack(
  sound("bd ~ ~ bd ~ bd ~").bank("RolandTR909").gain(0.7),
  sound("~ ~ sd ~ ~ ~ sd").bank("RolandTR909").gain(0.6),
  sound("hh hh hh hh hh hh [hh oh]").bank("RolandTR909").gain(0.2).cutoff(perlin.range(4000,9000).slow(7)),
  note("d2 ~ ~ a1 ~ g1 ~").sound("sawtooth").lpf(perlin.range(250,700).slow(5)).gain(0.35).fm(0.6),
  note("d1 ~ ~ a0 ~ g0 ~").sound("sine").gain(0.25).lpf(100),
  note("<[d3,a3,e4] [c3,g3,d4] [bb2,f3,c4] [a2,e3,b3]>").sound("triangle").gain(perlin.range(0.06,0.12).slow(6)).room(0.5).delay(0.2).lpf(perlin.range(1500,4000).slow(8)).slow(2),
  note("d5 [e5 f5] g5 a5 [g5 f5] e5 d5").sound("triangle").gain(0.18).room(0.4).delay(0.15).lpf(5000),
  note("a5 ~ ~ ~ ~ ~ ~ ~ ~ ~ g5 ~ ~ ~ f5 ~ ~ ~ ~ ~ ~ e5 ~ ~ ~ ~ ~ ~ d5 ~ ~ ~ ~ ~").sound("sine").gain(0.09).room(0.65).delay(0.4)
)' "Seven - 7/8 groove in D dorian"
  sleep 180

  # ===== 6. SEVEN pt2 - harmony shifts =====
  send 'setcps(0.55)
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
)' "Seven pt 2 - two voices, harmony shifts"
  sleep 180

  # ===== 7. BELLOW BREATH (accordion, 4 min) =====
  send 'setcps(0.45)
stack(
  note("<[g3,b3,d4] [c3,e3,g3] [a2,c3,e3] [d3,f#3,a3]>").sound("square").gain(perlin.range(0.03,0.1).slow(3)).lpf(perlin.range(800,2500).slow(4)).room(0.3),
  note("g4 [a4 b4] [c5 d5 c5] b4 a4 [g4 f#4] [g4 a4] [b4 ~]").sound("square").gain(0.12).lpf(perlin.range(1500,4000).slow(5)).room(0.25),
  note("g2 ~ d2 ~ c2 ~ d2 ~").sound("square").gain(0.15).lpf(perlin.range(300,800).slow(6)),
  note("g1 ~ d1 ~ c1 ~ d1 ~").sound("sine").gain(0.12).lpf(150),
  sound("bd ~ ~ ~ bd ~ ~ ~").bank("RolandTR909").gain(0.3).speed(0.7).lpf(200),
  note("b4 [c5 d5] [e5 ~ e5] d5 c5 [b4 a4] [b4 c5] [d5 ~]").sound("square").gain(perlin.range(0,0.08).slow(4)).lpf(3000).room(0.3)
)' "Bellow Breath - accordion vibes"
  sleep 240

  # ===== 8. E MINOR BLOOM (ambient groove, 4 min) =====
  send 'setcps(0.5)
stack(
  sound("bd ~ [~ bd] ~ bd ~ [~ bd] ~").bank("RolandTR909").gain(0.6),
  sound("~ ~ sd ~ ~ ~ sd ~").bank("RolandTR909").gain(0.5),
  sound("[hh hh] [hh hh] [hh oh] [hh hh]").bank("RolandTR909").gain(0.18).cutoff(perlin.range(3000,7000).slow(5)),
  note("e2 ~ [b1 ~] ~ e2 ~ [g1 ~] ~").sound("sawtooth").lpf(perlin.range(200,600).slow(4)).gain(0.3).fm(0.5),
  note("e1 ~ [b0 ~] ~ e1 ~ [g0 ~] ~").sound("sine").gain(0.2).lpf(90),
  note("<[e3,g3,b3,d4] [c3,e3,g3,b3] [a2,c3,e3,g3] [b2,d3,f#3,a3]>").sound("triangle").gain(0.08).room(0.5).delay(0.2).lpf(perlin.range(1200,3000).slow(6)).slow(2),
  note("b4 [e5 ~] [g5 f#5] [e5 ~] d5 [b4 ~] [c5 ~] [d5 ~]").sound("sine").gain(0.14).room(0.55).delay(0.25),
  note("~ ~ ~ e6 ~ ~ ~ ~ ~ ~ ~ b5 ~ ~ ~ ~").sound("sine").gain(0.07).room(0.7).delay(0.4)
)' "E Minor Bloom - ambient groove"
  sleep 240

  # ===== 9. EVERYTHING I LEARNED (minimal 7/8, 5 min) =====
  send 'setcps(0.4)
stack(
  sound("bd ~ ~ bd ~ [~ bd] ~").bank("RolandTR909").gain(perlin.range(0.15,0.4).slow(9)).speed(0.8).lpf(180),
  sound("~ ~ [~ sd] ~ ~ ~ ~").bank("RolandTR909").gain(perlin.range(0.1,0.35).slow(7)),
  note("c2 ~ ~ ~ ~ ~ ~").sound("sawtooth").lpf(perlin.range(150,500).slow(8)).gain(perlin.range(0.1,0.3).slow(6)).fm(perlin.range(0.3,1.2).slow(11)),
  note("c1 ~ ~ ~ ~ ~ ~").sound("sine").gain(0.15).lpf(80),
  note("<[c3,eb3,g3,bb3] [f2,ab2,c3,eb3] [g2,bb2,d3,f3] [ab2,c3,eb3,g3]>").sound("triangle").gain(perlin.range(0.03,0.09).slow(5)).room(0.55).delay(0.25).lpf(perlin.range(1000,3000).slow(7)).slow(2),
  note("eb5 ~ ~ ~ ~ g5 ~ ~ ~ ~ ~ ~ ~ c5 ~ ~ ~ ~ ~ ~ ~").sound("sine").gain(0.13).room(0.65).delay(0.35),
  note("~ ~ ~ ~ ~ ~ ~ ~ ~ ~ bb5 ~ ~ ~ ~ ~ ~ ~ ~ ~ ~").sound("sine").gain(perlin.range(0,0.1).slow(13)).room(0.8).delay(0.5)
)' "Everything I Learned - minimal breathing 7/8"
  sleep 300

  # ===== 10. LIQUID DnB (groove, 3 min) =====
  send 'setcps(1.4)
stack(
  sound("bd [~ bd] ~ bd [~ bd] ~ [bd ~] ~").bank("RolandTR909").gain(0.7).speed(1.05),
  sound("~ ~ sd ~ ~ [~ sd:1] ~ sd").bank("RolandTR909").gain(0.65),
  sound("[hh hh] [hh hh] [hh oh] [hh hh] [hh hh] [hh hh] [oh hh] [hh hh]").bank("RolandTR909").gain(0.2).cutoff(perlin.range(4000,8000).slow(5)),
  note("c2 ~ [eb2 ~] ~ g2 ~ [f2 ~] ~ eb2 ~ [d2 ~] ~ c2 ~ [bb1 ~] ~").sound("sawtooth").lpf(perlin.range(300,900).slow(4)).gain(0.35).fm(0.8),
  note("c1 ~ [eb1 ~] ~ g1 ~ [f1 ~] ~ eb1 ~ [d1 ~] ~ c1 ~ [bb0 ~] ~").sound("sine").gain(0.3).lpf(110),
  note("<[c3,eb3,g3,bb3,d4] [ab2,c3,eb3,g3,bb3] [bb2,d3,f3,ab3,c4] [g2,bb2,d3,f3,ab3]>").sound("triangle").gain(0.1).room(0.5).delay(0.2).lpf(perlin.range(1500,4000).slow(6)).slow(2),
  note("~ ~ ~ [c4,eb4,bb4] ~ ~ ~ ~ ~ ~ [ab3,c4,g4] ~ ~ ~ ~ ~").sound("sine").gain(0.12).room(0.5).delay(0.3),
  note("c5 [eb5 g5] ~ [bb4 c5] eb5 [g5 f5] [eb5 d5] [c5 ~]").sound("triangle").vowel("<a e o a>").gain(0.15).room(0.45).delay(0.25).lpf(perlin.range(3000,7000).slow(4)),
  note("~ g6 ~ ~ ~ eb6 ~ ~ ~ c6 ~ ~ ~ bb5 ~ ~").sound("sine").gain(0.06).room(0.7).delay(0.4)
)' "Liquid DnB - walking bass, jazz chords"
  sleep 180

  # ===== 11. METALCORE VERSE (heavy, 2 min) =====
  send 'setcps(0.7)
stack(
  sound("bd [~ bd] [bd ~] bd [~ bd] bd [bd bd] [~ bd]").bank("RolandTR909").gain(0.95).speed(0.9),
  sound("~ sd [~ sd:1] ~ ~ sd ~ [sd sd]").bank("RolandTR909").gain(0.8),
  sound("[hh hh] [hh hh] [oh hh] [hh hh] [hh hh] [hh hh] [oh hh] [hh hh hh]").bank("RolandTR909").gain(0.3).cutoff(7000),
  note("c2 c2 [c2 c2 c2 c2] [bb1 c2] ab1 [ab1 ab1 ab1 ab1] [bb1 c2] [g1 ab1]").sound("gm_distortion_guitar").gain(0.55).clip(0.12).lpf(2800),
  note("c3 c3 [c3 c3 c3 c3] [bb2 c3] ab2 [ab2 ab2 ab2 ab2] [bb2 c3] [g2 ab2]").sound("gm_overdriven_guitar").gain(0.4).lpf(3500),
  note("c1 c1 [c1 c1 c1 c1] [bb0 c1] ab0 [ab0 ab0 ab0 ab0] [bb0 c1] [g0 ab0]").sound("square").lpf(200).gain(0.55).fm(2),
  note("c4 [eb4 c4] [g4 eb4 c4 eb4] [f4 eb4] ab4 [g4 f4 eb4 f4] [g4 ab4] [bb4 g4]").sound("sawtooth").vowel("<a e i o>").gain(0.28).lpf(4000).distort(0.3).room(0.1),
  note("c3 [eb3 c3] [g3 ~] [f3 eb3] ab3 [g3 ~ eb3 ~] [g3 ab3] [bb3 ~]").sound("square").vowel("<o a e i>").gain(0.18).lpf(3000)
).compressor("-10:25:10:.002:.02").postgain(1.2)' "Metalcore - screaming verse"
  sleep 120

  # ===== 12. METALCORE CHORUS (clean, 2 min) =====
  send 'setcps(0.7)
stack(
  sound("bd ~ ~ ~ bd ~ ~ ~ bd ~ ~ ~ bd [~ bd] ~ ~").bank("RolandTR909").gain(0.9).speed(0.9),
  sound("~ ~ ~ ~ ~ ~ ~ sd ~ ~ ~ ~ ~ ~ ~ sd").bank("RolandTR909").gain(0.85),
  sound("[hh hh] [hh hh] [hh hh] [hh oh] [hh hh] [hh hh] [hh hh] [hh oh]").bank("RolandTR909").gain(0.25).cutoff(6000),
  note("[c4 eb4 g4 c5] [c4 eb4 g4 c5] [ab3 c4 eb4 ab4] [ab3 c4 eb4 ab4] [bb3 d4 f4 bb4] [bb3 d4 f4 bb4] [g3 bb3 d4 g4] [g3 bb3 d4 g4]").sound("gm_electric_guitar_clean").gain(0.35).room(0.3).delay(0.2),
  note("<c3 ab2 bb2 g2>").sound("gm_overdriven_guitar").gain(0.4).lpf(3000).room(0.15),
  note("c1 ~ [c1 ~] ~ ab0 ~ [ab0 ~] ~ bb0 ~ [bb0 ~] ~ g0 ~ [g0 ~] ~").sound("sawtooth").lpf(250).gain(0.5).fm(1.5),
  note("eb5 ~ g5 [f5 eb5] c5 ~ eb5 [d5 c5] f5 ~ ab5 [g5 f5] eb5 ~ [d5 c5] ~").sound("triangle").vowel("<a o e a>").gain(0.3).room(0.35).delay(0.15).lpf(5000),
  note("g5 ~ bb5 [ab5 g5] eb5 ~ g5 [f5 eb5] ab5 ~ c6 [bb5 ab5] g5 ~ [f5 eb5] ~").sound("sine").vowel("<a o e a>").gain(0.2).room(0.4).delay(0.2),
  note("<[c4,eb4,g4] [ab3,c4,eb4] [bb3,d4,f4] [g3,bb3,d4]>").sound("sawtooth").lpf(sine.range(1500,3500).slow(4)).gain(0.12).room(0.4)
).compressor("-8:20:10:.003:.03").postgain(1.1)' "Metalcore - clean chorus soars"
  sleep 120

  # ===== 13. BALKAN 7/8 (folk, 3 min) =====
  send 'setcps(0.6)
stack(
  sound("bd ~ ~ bd ~ [bd ~]~").bank("RolandTR909").gain(0.65),
  sound("~ ~ sd ~ ~ ~ [sd ~]").bank("RolandTR909").gain(0.55),
  sound("hh hh hh hh hh [hh oh] hh").bank("RolandTR909").gain(0.2).cutoff(6000),
  note("d2 ~ ~ a1 ~ [g1 a1] ~").sound("sawtooth").lpf(perlin.range(200,500).slow(5)).gain(0.3).fm(0.5),
  note("d1 ~ ~ a0 ~ [g0 a0] ~").sound("sine").gain(0.2).lpf(100),
  note("<[d3,f#3,a3] [g2,b2,d3] [a2,c#3,e3] [d3,f#3,a3]>").sound("square").gain(perlin.range(0.04,0.1).slow(4)).lpf(perlin.range(600,2000).slow(5)).room(0.3).slow(2),
  note("d5 [e5 f#5] [g5 a5 g5] [f#5 e5] d5 [c#5 d5] [e5 ~]").sound("square").gain(0.13).lpf(perlin.range(1200,3500).slow(5)).room(0.25),
  note("f#5 [g5 a5] [b5 ~ b5] [a5 g5] f#5 [e5 f#5] [g5 ~]").sound("square").gain(perlin.range(0,0.08).slow(6)).lpf(2500).room(0.3)
)' "Balkan Dance - 7/8 in D major"
  sleep 180

  # ===== 14. GENERATIVE GARDEN (never repeats, 5 min) =====
  send 'setcps(0.45)
stack(
  sound("bd ~ [~ bd] ~").euclid(3,8).bank("RolandTR909").gain(perlin.range(0.3,0.6).slow(5)),
  sound("~ ~ sd ~").bank("RolandTR909").gain(0.5),
  sound("hh*8").bank("RolandTR909").gain(perlin.range(0.05,0.2).slow(3)).cutoff(perlin.range(3000,10000).slow(4)),
  note("<c2 [c2 eb2] [g1 ab1] [bb1 c2]>").sound("sawtooth").lpf(perlin.range(150,600).slow(7)).gain(perlin.range(0.15,0.35).slow(5)).fm(perlin.range(0.3,1.5).slow(9)),
  note("<[c3,eb3,g3] [ab2,c3,eb3] [g2,bb2,d3] [bb2,eb3,g3]>").sound("triangle").gain(perlin.range(0.04,0.1).slow(6)).room(0.5).delay(0.2).lpf(perlin.range(1000,3500).slow(8)).slow(2),
  note("c5 ~ eb5 ~ g5 ~ bb5 ~ ab5 ~ g5 ~ f5 ~ eb5 ~ d5 ~ c5 ~").sound("sine").gain(perlin.range(0,0.15).slow(4)).room(0.6).delay(0.35).degradeBy(perlin.range(0.3,0.8).slow(5)),
  note("~ ~ ~ ~ ~ ~ ~ g6 ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ eb6 ~ ~ ~ ~").sound("sine").gain(0.06).room(0.8).delay(0.5)
)' "Generative Garden - never the same twice"
  sleep 300

  # ===== 15. WIND DOWN - back to deep space =====
  send 'setcps(0.2)
stack(
  note("<c2 bb1 ab1 g1>").sound("sine").gain(perlin.range(0.1,0.25).slow(10)).lpf(perlin.range(80,250).slow(8)).slow(8),
  note("<[c3,eb3,g3] [bb2,d3,f3] [ab2,c3,eb3] [g2,bb2,d3]>").sound("sawtooth").lpf(perlin.range(300,1500).slow(6)).gain(0.06).room(0.7).delay(0.35).slow(8),
  note("g5 ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ eb5 ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ c5 ~ ~ ~ ~ ~ ~ ~").sound("sine").gain(perlin.range(0,0.1).slow(7)).room(0.8).delay(0.5)
)' "Winding down... returning to the void"
  sleep 240

  echo ""
  echo "=== Cycle $CYCLE complete. Looping... ==="

done
