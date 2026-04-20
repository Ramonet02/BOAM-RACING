/**
 * MountainDivider — Desert dune silhouette
 *
 * Replicates the look of a sand dune profile:
 *   · One large, smooth asymmetric dune (long left slope, steeper right)
 *   · Two inner ridge lines showing dune depth
 *   · Sand-coloured base that flushes with the next section
 */
export default function MountainDivider() {
  const sand = "#F7F4EB";
  const dark = "#1a1714";

  // ── Main dune outer edge ──────────────────────────────────────────
  // Enters bottom-left, rises very gently across ~60% of the width,
  // peaks around x=760 (slightly right of centre), then drops steeper.
  const dune = `
    M0,300 L0,238
    C 60,232  200,195  380,145
    C 480,120  570,88   660,55
    C 710,38   740,22   765,14
    C 790,6    820,10   855,28
    C 920,58   1000,110 1100,168
    C 1180,210 1280,248 1440,258
    L1440,300 Z
  `;

  // ── Inner ridge 1 (close to the crest) ───────────────────────────
  const ridge1 = `
    M0,258
    C 80,248  230,210  420,162
    C 520,138  610,108  698,78
    C 732,66   758,56   778,52
    C 798,48   820,52   858,68
    C 928,98   1010,148 1112,202
    C 1210,248 1340,268 1440,274
  `;

  // ── Inner ridge 2 (lower flank, wider separation) ────────────────
  const ridge2 = `
    M0,272
    C 100,264  260,232  460,185
    C 560,162  645,138  730,112
    C 760,102  782,96   800,94
    C 820,92   842,96   876,110
    C 944,136  1028,182 1130,228
    C 1240,268 1360,282 1440,286
  `;

  return (
    <div className="absolute bottom-0 left-0 w-full pointer-events-none select-none z-20">
      <svg
        viewBox="0 0 1440 300"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ display: "block", width: "100%", height: "clamp(160px, 20vw, 300px)" }}
      >
        {/* Sand base — flushes with next section */}
        <path
          fill={sand}
          d={`M0,300 L0,250 C 360,244 720,248 1080,244 C 1260,242 1380,246 1440,248 L1440,300 Z`}
        />

        {/* Main dune silhouette — sand colour, cuts into the dark hero */}
        <path fill={sand} d={dune} />

        {/* Ridge line 1 — subtle dark stroke for dune depth */}
        <path
          fill="none"
          stroke={dark}
          strokeWidth="1.4"
          strokeOpacity="0.18"
          d={ridge1}
        />

        {/* Ridge line 2 — even subtler lower flank */}
        <path
          fill="none"
          stroke={dark}
          strokeWidth="1"
          strokeOpacity="0.1"
          d={ridge2}
        />
      </svg>
    </div>
  );
}
