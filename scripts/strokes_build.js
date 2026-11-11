// strokes_build.js: one-time build of the handwriting stroke data for the letter-writing practice (#/write).
//
// Usage (from the project root):
//   node scripts/strokes_build.js [--png] [--only ກຂຄ]
//
// Reads   scripts/assets/NotoSansLao-Regular.ttf (SIL OFL, see scripts/assets/OFL.txt)
//         scripts/assets/NotoSansLao-Regular.ttf (same licence; letters with "font": "plain" in the overrides)
//         scripts/strokes_overrides.json, hand corrections per letter:
//           {"font": "plain", "reverse": [stroke indexes], "order": [stroke indexes], "parts": [count or [cut indexes] per stroke]}
//         data/letters.csv (letter ids)
// Writes  app/frontend/data/strokes.json
//         tmp/strokes/sheet.png with --png (every letter: glyph in grey, strokes green -> red, start dot blue)
//
// How: each glyph outline is rasterised, thinned to a one-pixel skeleton (Zhang-Suen), and the skeleton is read as
// a graph. At every junction the two smoothest branches are joined, which turns the graph into pen strokes. A stroke
// starts at its loop (Lao letters are written from the loop outwards) unless the overrides say otherwise.
// No dependencies: the TTF parser, rasteriser and PNG writer are in this file.
//
// Accuracy: the geometry is `derived` from the font. Stroke order and direction are the agent's work (`unverified`);
// see docs/QUESTIONS.md.
'use strict'
const fs = require('node:fs')
const path = require('node:path')
const zlib = require('node:zlib')

const ROOT = path.resolve(__dirname, '..')
const FONT = path.join(ROOT, 'scripts', 'assets', 'NotoSansLaoLooped-Regular.ttf')
const FONT_PLAIN = path.join(ROOT, 'scripts', 'assets', 'NotoSansLao-Regular.ttf') // for letters with "font": "plain"
const OVERRIDES = path.join(ROOT, 'scripts', 'strokes_overrides.json')
const OUT = path.join(ROOT, 'app', 'frontend', 'data', 'strokes.json')
const args = process.argv.slice(2)
const wantPng = args.includes('--png')
const only = args.includes('--only') ? [...args[args.indexOf('--only') + 1]] : null

const PX_PER_EM = 640 // raster resolution
const BOX = 100
const MARGIN = 14 // box units kept free around the tallest letter
const STEP = 1.5 // spacing of output points, box units

// ------------------------------------------------------------------ TTF
function parseFont(buf) {
  const tables = {}
  const n = buf.readUInt16BE(4)
  for (let i = 0; i < n; i++) {
    const o = 12 + 16 * i
    tables[buf.toString('latin1', o, o + 4)] = buf.readUInt32BE(o + 8)
  }
  const unitsPerEm = buf.readUInt16BE(tables.head + 18)
  const longLoca = buf.readInt16BE(tables.head + 50) === 1
  const loca = (g) => (longLoca ? buf.readUInt32BE(tables.loca + 4 * g) : 2 * buf.readUInt16BE(tables.loca + 2 * g))

  // cmap: a format 4 subtable is enough for the Lao block
  let cmap4 = 0
  const cm = tables.cmap
  for (let i = 0; i < buf.readUInt16BE(cm + 2); i++) {
    const sub = cm + buf.readUInt32BE(cm + 4 + 8 * i + 4)
    if (buf.readUInt16BE(sub) === 4) cmap4 = sub
  }
  if (!cmap4) throw new Error('no format 4 cmap')
  const segs = buf.readUInt16BE(cmap4 + 6) / 2
  const endAt = cmap4 + 14
  const startAt = endAt + 2 * segs + 2
  const deltaAt = startAt + 2 * segs
  const rangeAt = deltaAt + 2 * segs
  function glyphIndex(cp) {
    for (let i = 0; i < segs; i++) {
      if (cp > buf.readUInt16BE(endAt + 2 * i)) continue
      const start = buf.readUInt16BE(startAt + 2 * i)
      if (cp < start) return 0
      const delta = buf.readInt16BE(deltaAt + 2 * i)
      const range = buf.readUInt16BE(rangeAt + 2 * i)
      if (!range) return (cp + delta) & 0xffff
      const g = buf.readUInt16BE(rangeAt + 2 * i + range + 2 * (cp - start))
      return g ? (g + delta) & 0xffff : 0
    }
    return 0
  }

  // -> contours: arrays of {x, y, on}
  function glyph(g, depth = 0) {
    const off = tables.glyf + loca(g)
    if (loca(g + 1) === loca(g)) return []
    const nc = buf.readInt16BE(off)
    let p = off + 10
    if (nc >= 0) {
      const ends = []
      for (let i = 0; i < nc; i++, p += 2) ends.push(buf.readUInt16BE(p))
      const np = nc ? ends[nc - 1] + 1 : 0
      p += 2 + buf.readUInt16BE(p)
      const flags = []
      while (flags.length < np) {
        const f = buf[p++]
        flags.push(f)
        if (f & 8) for (let r = buf[p++]; r > 0; r--) flags.push(f)
      }
      const xs = []
      let v = 0
      for (const f of flags) {
        if (f & 2) v += f & 16 ? buf[p++] : -buf[p++]
        else if (!(f & 16)) (v += buf.readInt16BE(p)), (p += 2)
        xs.push(v)
      }
      const ys = []
      v = 0
      for (const f of flags) {
        if (f & 4) v += f & 32 ? buf[p++] : -buf[p++]
        else if (!(f & 32)) (v += buf.readInt16BE(p)), (p += 2)
        ys.push(v)
      }
      const out = []
      let s = 0
      for (const e of ends) {
        const c = []
        for (let i = s; i <= e; i++) c.push({ x: xs[i], y: ys[i], on: !!(flags[i] & 1) })
        out.push(c)
        s = e + 1
      }
      return out
    }
    if (depth > 4) return []
    const out = []
    for (;;) {
      const f = buf.readUInt16BE(p)
      const gi = buf.readUInt16BE(p + 2)
      p += 4
      let dx, dy
      if (f & 1) (dx = buf.readInt16BE(p)), (dy = buf.readInt16BE(p + 2)), (p += 4)
      else (dx = buf.readInt8(p)), (dy = buf.readInt8(p + 1)), (p += 2)
      let a = 1, b = 0, c = 0, d = 1
      const f2 = () => ((p += 2), buf.readInt16BE(p - 2) / 16384)
      if (f & 8) a = d = f2()
      else if (f & 0x40) (a = f2()), (d = f2())
      else if (f & 0x80) (a = f2()), (b = f2()), (c = f2()), (d = f2())
      if (!(f & 2)) dx = dy = 0 // point-matching components are not used by this font
      for (const ct of glyph(gi, depth + 1)) out.push(ct.map((q) => ({ x: a * q.x + c * q.y + dx, y: b * q.x + d * q.y + dy, on: q.on })))
      if (!(f & 0x20)) break
    }
    return out
  }
  return { unitsPerEm, glyphIndex, glyph }
}

// TrueType contour (quadratic, implied on-curve midpoints) -> closed polygon
function flatten(contour) {
  const n = contour.length
  if (n < 2) return []
  const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, on: true })
  let start = contour.findIndex((q) => q.on)
  const pts = []
  let first
  if (start < 0) (first = mid(contour[0], contour[1])), (start = 0)
  else first = contour[start]
  pts.push([first.x, first.y])
  let cur = first
  for (let k = 1; k <= n; k++) {
    const q = contour[(start + k) % n]
    if (first !== contour[start] && k === n) break
    if (q.on) {
      pts.push([q.x, q.y])
      cur = q
      continue
    }
    const nxt = contour[(start + k + 1) % n]
    const end = nxt.on ? nxt : mid(q, nxt)
    for (let s = 1; s <= 8; s++) {
      const u = s / 8
      pts.push([(1 - u) * (1 - u) * cur.x + 2 * u * (1 - u) * q.x + u * u * end.x, (1 - u) * (1 - u) * cur.y + 2 * u * (1 - u) * q.y + u * u * end.y])
    }
    cur = end
    if (nxt.on) k++
  }
  return pts
}

// ------------------------------------------------------------------ raster + thinning
function rasterise(polys, W, H) {
  const img = new Uint8Array(W * H)
  for (let y = 0; y < H; y++) {
    const yc = y + 0.5
    const xs = []
    for (const poly of polys) {
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i], b = poly[(i + 1) % poly.length]
        if (a[1] <= yc === b[1] <= yc) continue
        xs.push([a[0] + ((yc - a[1]) * (b[0] - a[0])) / (b[1] - a[1]), a[1] < b[1] ? 1 : -1])
      }
    }
    xs.sort((p, q) => p[0] - q[0])
    let wind = 0
    for (let i = 0; i < xs.length - 1; i++) {
      wind += xs[i][1]
      if (!wind) continue
      const x0 = Math.max(0, Math.ceil(xs[i][0] - 0.5)), x1 = Math.min(W - 1, Math.floor(xs[i + 1][0] - 0.5))
      for (let x = x0; x <= x1; x++) img[y * W + x] = 1
    }
  }
  return img
}

const NB = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]] // N NE E SE S SW W NW

function thin(src, W, H) {
  const img = Uint8Array.from(src)
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : img[y * W + x])
  let changed = true
  while (changed) {
    changed = false
    for (let pass = 0; pass < 2; pass++) {
      const kill = []
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          if (!img[y * W + x]) continue
          const p = NB.map(([dx, dy]) => at(x + dx, y + dy))
          const b = p.reduce((s, v) => s + v, 0)
          if (b < 2 || b > 6) continue
          let a = 0
          for (let i = 0; i < 8; i++) if (!p[i] && p[(i + 1) % 8]) a++
          if (a !== 1) continue
          const [n, , e, , s, , w] = p
          if (pass === 0 ? n * e * s || e * s * w : n * e * w || n * s * w) continue
          kill.push(y * W + x)
        }
      for (const k of kill) img[k] = 0
      if (kill.length) changed = true
    }
  }
  // remove staircase corners so every skeleton pixel that is not a junction has at most two neighbours
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (!img[y * W + x]) continue
      const [n, ne, e, se, s, sw, w, nw] = NB.map(([dx, dy]) => at(x + dx, y + dy))
      if ((n && e && !sw && !s && !w) || (e && s && !nw && !n && !w) || (s && w && !ne && !n && !e) || (w && n && !se && !s && !e)) img[y * W + x] = 0
    }
  return img
}

// ------------------------------------------------------------------ skeleton -> graph
function buildGraph(sk, W, H) {
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : sk[y * W + x])
  const nbrs = (i) => {
    const x = i % W, y = (i / W) | 0
    const out = []
    for (const [dx, dy] of NB) if (at(x + dx, y + dy)) out.push((y + dy) * W + x + dx)
    return out
  }
  const nodeOf = new Int32Array(W * H).fill(-1)
  const nodes = [] // {pix: [...], x, y, end: bool}
  for (let i = 0; i < W * H; i++) {
    if (!sk[i] || nodeOf[i] >= 0) continue
    const d = nbrs(i).length
    if (d === 2) continue
    if (d <= 1) {
      nodeOf[i] = nodes.length
      nodes.push({ pix: [i], end: true })
      continue
    }
    const pix = []
    const stack = [i]
    nodeOf[i] = nodes.length
    while (stack.length) {
      const c = stack.pop()
      pix.push(c)
      for (const q of nbrs(c)) if (nodeOf[q] < 0 && nbrs(q).length >= 3) (nodeOf[q] = nodes.length), stack.push(q)
    }
    nodes.push({ pix, end: false })
  }
  for (const nd of nodes) {
    nd.x = nd.pix.reduce((s, i) => s + (i % W), 0) / nd.pix.length
    nd.y = nd.pix.reduce((s, i) => s + ((i / W) | 0), 0) / nd.pix.length
  }
  const seen = new Uint8Array(W * H)
  const edges = [] // {a, b, pix: [interior pixel indices], pts: [[x,y]...] from node a to node b}
  const xy = (i) => [i % W, (i / W) | 0]
  const walk = (from, first) => {
    const pix = [first]
    seen[first] = 1
    let prev = from, cur = first
    for (;;) {
      const ns = nbrs(cur).filter((q) => q !== prev)
      const node = ns.find((q) => nodeOf[q] >= 0 && (q !== from || pix.length > 2))
      if (node !== undefined) return { end: nodeOf[node], pix }
      const nxt = ns.find((q) => !seen[q] && nodeOf[q] < 0)
      if (nxt === undefined) return { end: -1, pix }
      seen[nxt] = 1
      pix.push(nxt)
      prev = cur
      cur = nxt
    }
  }
  nodes.forEach((nd, a) => {
    for (const p of nd.pix)
      for (const q of nbrs(p)) {
        if (nodeOf[q] >= 0 || seen[q]) continue
        const { end, pix } = walk(p, q)
        if (end < 0) continue
        edges.push({ a, b: end, pix, pts: [[nd.x, nd.y], ...pix.map(xy), [nodes[end].x, nodes[end].y]] })
      }
  })
  // rings with no node at all (a plain circle)
  for (let i = 0; i < W * H; i++) {
    if (!sk[i] || seen[i] || nodeOf[i] >= 0) continue
    const pix = [i]
    seen[i] = 1
    let cur = i
    for (;;) {
      const nxt = nbrs(cur).find((q) => !seen[q])
      if (nxt === undefined) break
      seen[nxt] = 1
      pix.push(nxt)
      cur = nxt
    }
    const pts = pix.map(xy)
    pts.push(pts[0])
    edges.push({ a: -1, b: -1, pix, pts })
  }
  return { nodes, edges }
}

const len = (pts) => pts.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0)

// Remove short spurs (thinning artefacts at corners and stroke ends), then rebuild.
function cleanGraph(sk, W, H, minSpur) {
  for (let guard = 0; guard < 20; guard++) {
    const g = buildGraph(sk, W, H)
    const spurs = g.edges.filter((e) => e.a >= 0 && g.nodes[e.a].end !== g.nodes[e.b].end && len(e.pts) < minSpur)
    if (!spurs.length) return g
    for (const e of spurs) {
      for (const p of e.pix) sk[p] = 0
      const endNode = g.nodes[e.a].end ? g.nodes[e.a] : g.nodes[e.b]
      for (const p of endNode.pix) sk[p] = 0
    }
    // a junction that lost a branch may now be a fat corner: thin it again
    sk.set(thin(sk, W, H))
  }
  return buildGraph(sk, W, H)
}

// A crossing usually thins to two junctions joined by a very short edge: make it one junction again.
function contract(g, maxLen) {
  for (;;) {
    const i = g.edges.findIndex((e) => e.a >= 0 && e.a !== e.b && !g.nodes[e.a].end && !g.nodes[e.b].end && len(e.pts) < maxLen)
    if (i < 0) return g
    const { a, b } = g.edges[i]
    g.edges.splice(i, 1)
    const na = g.nodes[a], nb = g.nodes[b]
    na.x = (na.x + nb.x) / 2
    na.y = (na.y + nb.y) / 2
    for (const e of g.edges) {
      if (e.a === b) e.a = a
      if (e.b === b) e.b = a
      if (e.a === a) e.pts[0] = [na.x, na.y]
      if (e.b === a) e.pts[e.pts.length - 1] = [na.x, na.y]
    }
  }
}

// ------------------------------------------------------------------ graph -> strokes
function strokesOf(g, look) {
  const ends = [] // edge-ends: {e, side: 0 (at a) | 1 (at b), node, t: tangent leaving the node, mate}
  g.edges.forEach((e, ei) => {
    if (e.a < 0) return
    for (const side of [0, 1]) {
      const pts = side ? [...e.pts].reverse() : e.pts
      let k = 1, d = 0
      while (k < pts.length - 1 && d < look) (d += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1])), k++
      const tx = pts[k][0] - pts[0][0], ty = pts[k][1] - pts[0][1], tl = Math.hypot(tx, ty) || 1
      ends.push({ e: ei, side, node: side ? e.b : e.a, t: [tx / tl, ty / tl], mate: null })
    }
  })
  g.nodes.forEach((nd, ni) => {
    const here = ends.filter((x) => x.node === ni)
    const pairs = []
    for (let i = 0; i < here.length; i++)
      for (let j = i + 1; j < here.length; j++) {
        if (here[i].e === here[j].e && here.length > 2) continue // a loop does not continue into itself
        pairs.push([here[i].t[0] * here[j].t[0] + here[i].t[1] * here[j].t[1], here[i], here[j]])
      }
    pairs.sort((p, q) => p[0] - q[0])
    let first = true
    for (const [dot, x, y] of pairs) {
      if (x.mate || y.mate) continue
      if (!first && dot > 0.3) break // a second pair only when it is a real crossing
      x.mate = y
      y.mate = x
      first = false
    }
  })
  const used = new Set()
  const strokes = []
  const follow = (start) => {
    const pts = []
    let loopStart = false
    let cur = start
    let lastFar = start
    for (let n = 0; cur && !used.has(cur.e); n++) {
      used.add(cur.e)
      const e = g.edges[cur.e]
      const seg = cur.side ? [...e.pts].reverse() : e.pts
      if (n === 0 && e.a === e.b) loopStart = true
      pts.push(...(pts.length ? seg.slice(1) : seg))
      const far = ends.find((x) => x.e === cur.e && x.side !== cur.side)
      lastFar = far
      cur = far.mate
    }
    const last = [...used].pop()
    const lastEdge = g.edges[last]
    return { pts, loopStart, loopEnd: lastEdge.a === lastEdge.b, first: start.e, last, startNode: start.node, endNode: lastFar.node }
  }
  for (const x of ends) if (!x.mate && !used.has(x.e)) strokes.push(follow(x))
  for (const x of ends) if (!used.has(x.e)) strokes.push({ ...follow(x), closed: true })
  g.edges.forEach((e) => e.a < 0 && strokes.push({ pts: e.pts, closed: true }))

  // Retraced spurs: where a stroke starts at a junction J and another stroke ends at the tip of a dead-end branch of
  // J, the pen went out to the tip and came back the same way. Join them into one stroke.
  const flip = (s) => ({ ...s, pts: [...s.pts].reverse(), loopStart: s.loopEnd, loopEnd: s.loopStart, first: s.last, last: s.first, startNode: s.endNode, endNode: s.startNode })
  for (let again = true; again; ) {
    again = false
    outer: for (const y0 of strokes) {
      if (y0.closed) continue
      for (const y of [y0, flip(y0)]) {
        const J = y.startNode
        if (g.nodes[J].end || y.loopStart) continue
        for (const x0 of strokes) {
          if (x0 === y0 || x0.closed) continue
          for (const x of [x0, flip(x0)]) {
            const S = g.edges[x.last]
            if (!g.nodes[x.endNode].end || (S.a !== J && S.b !== J)) continue
            const spur = S.a === J ? S.pts : [...S.pts].reverse() // J -> tip
            const merged = { ...x, pts: [...x.pts, ...[...spur].reverse().slice(1), ...y.pts.slice(1)], loopEnd: y.loopEnd, last: y.last, endNode: y.endNode }
            strokes.splice(strokes.indexOf(x0), 1, merged)
            strokes.splice(strokes.indexOf(y0), 1)
            again = true
            break outer
          }
        }
      }
    }
  }
  return strokes
}

// ------------------------------------------------------------------ polyline helpers
function smooth(pts, r, closed) {
  const n = pts.length
  return pts.map((p, i) => {
    if (!closed && (i === 0 || i === n - 1)) return p
    let sx = 0, sy = 0, c = 0
    for (let k = -r; k <= r; k++) {
      let j = i + k
      if (closed) j = (j + n) % n
      else if (j < 0 || j >= n) continue
      sx += pts[j][0]
      sy += pts[j][1]
      c++
    }
    // shrink the window near open ends so the ends do not get pulled inwards
    if (!closed) {
      const rr = Math.min(r, i, n - 1 - i)
      sx = sy = c = 0
      for (let k = -rr; k <= rr; k++) (sx += pts[i + k][0]), (sy += pts[i + k][1]), c++
    }
    return [sx / c, sy / c]
  })
}

function resample(pts, step) {
  const total = len(pts)
  const n = Math.max(2, Math.round(total / step) + 1)
  const out = [pts[0]]
  let i = 1, acc = 0
  for (let k = 1; k < n - 1; k++) {
    const want = (total * k) / (n - 1)
    for (;;) {
      const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
      if (acc + d >= want || i === pts.length - 1) {
        const u = d ? Math.min(1, (want - acc) / d) : 0
        out.push([pts[i - 1][0] + u * (pts[i][0] - pts[i - 1][0]), pts[i - 1][1] + u * (pts[i][1] - pts[i - 1][1])])
        break
      }
      acc += d
      i++
    }
  }
  out.push(pts[pts.length - 1])
  return out
}

// lengthen an open end along its tangent (thinning eats about half a stroke width at each end)
function extend(pts, by) {
  const grow = (a, b) => {
    const dx = a[0] - b[0], dy = a[1] - b[1], d = Math.hypot(dx, dy) || 1
    return [a[0] + (dx / d) * by, a[1] + (dy / d) * by]
  }
  const k = Math.min(6, pts.length - 1)
  return [grow(pts[0], pts[k]), ...pts, grow(pts[pts.length - 1], pts[pts.length - 1 - k])]
}

// Split a stroke into teaching parts at its sharpest corners near the even division points.
function splitPoints(pts, count) {
  const cuts = []
  const n = pts.length
  const turn = (i) => {
    const w = 3
    if (i < w || i >= n - w) return 0
    const a = Math.atan2(pts[i][1] - pts[i - w][1], pts[i][0] - pts[i - w][0])
    const b = Math.atan2(pts[i + w][1] - pts[i][1], pts[i + w][0] - pts[i][0])
    let d = Math.abs(a - b)
    if (d > Math.PI) d = 2 * Math.PI - d
    return d
  }
  for (let k = 1; k < count; k++) {
    const target = Math.round(((n - 1) * k) / count)
    const slack = Math.round(n * 0.12)
    let best = target
    for (let i = Math.max(4, target - slack); i <= Math.min(n - 5, target + slack); i++) if (turn(i) > 0.6 && turn(i) > turn(best)) best = i
    cuts.push(best)
  }
  return cuts
}

// ------------------------------------------------------------------ PNG (debug sheet)
function writePng(file, W, H, rgb) {
  const raw = Buffer.alloc((W * 3 + 1) * H)
  for (let y = 0; y < H; y++) rgb.copy(raw, y * (W * 3 + 1) + 1, y * W * 3, (y + 1) * W * 3)
  const chunk = (type, data) => {
    const b = Buffer.alloc(12 + data.length)
    b.writeUInt32BE(data.length, 0)
    b.write(type, 4, 'latin1')
    data.copy(b, 8)
    b.writeUInt32BE(zlib.crc32(b.subarray(4, 8 + data.length)) >>> 0, 8 + data.length)
    return b
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(W, 0)
  ihdr.writeUInt32BE(H, 4)
  ihdr[8] = 8
  ihdr[9] = 2
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]))
}

// ------------------------------------------------------------------ main
function main() {
  const looped = parseFont(fs.readFileSync(FONT)), plain = parseFont(fs.readFileSync(FONT_PLAIN))
  if (looped.unitsPerEm !== plain.unitsPerEm) throw new Error('the two fonts differ in unitsPerEm')
  const overrides = fs.existsSync(OVERRIDES) ? JSON.parse(fs.readFileSync(OVERRIDES, 'utf8')) : {}
  const rows = fs.readFileSync(path.join(ROOT, 'data', 'letters.csv'), 'utf8').split(/\r?\n/).slice(1).map((l) => l.split(','))
  let letters = rows.filter((r) => r[3] === 'consonant' && [...r[1]].length === 1).map((r) => ({ id: r[0], ch: r[1] }))
  if (only) letters = letters.filter((l) => only.includes(l.ch))

  const sPx = PX_PER_EM / looped.unitsPerEm
  const glyphs = letters.map((l) => {
    const font = overrides[l.ch]?.font === 'plain' ? plain : looped
    const polys = font.glyph(font.glyphIndex(l.ch.codePointAt(0))).map(flatten).filter((p) => p.length > 2)
    if (!polys.length) throw new Error(`no outline for ${l.ch}`)
    const all = polys.flat()
    return { ...l, polys, minX: Math.min(...all.map((p) => p[0])), maxX: Math.max(...all.map((p) => p[0])), minY: Math.min(...all.map((p) => p[1])), maxY: Math.max(...all.map((p) => p[1])) }
  })
  // one scale and one baseline for every letter (font units -> box units)
  const gMinY = Math.min(...glyphs.map((g) => g.minY)), gMaxY = Math.max(...glyphs.map((g) => g.maxY))
  const gW = Math.max(...glyphs.map((g) => g.maxX - g.minX))
  const sBox = (BOX - 2 * MARGIN) / Math.max(gMaxY - gMinY, gW)
  const yOff = (BOX - (gMaxY - gMinY) * sBox) / 2

  const out = { version: 1, box: BOX, font: 'Noto Sans Lao Looped Regular (SIL OFL 1.1; a few letters from Noto Sans Lao, see scripts/strokes_overrides.json), centre lines derived by scripts/strokes_build.js', baseline: +(yOff + gMaxY * sBox).toFixed(1), letters: {} }
  const cells = []
  for (const g of glyphs) {
    const pad = 6
    const W = Math.ceil((g.maxX - g.minX) * sPx) + 2 * pad, H = Math.ceil((g.maxY - g.minY) * sPx) + 2 * pad
    const toPx = (p) => [(p[0] - g.minX) * sPx + pad, (g.maxY - p[1]) * sPx + pad]
    const img = rasterise(g.polys.map((poly) => poly.map(toPx)), W, H)
    const sk = thin(img, W, H)
    const area = img.reduce((s, v) => s + v, 0), skLen = sk.reduce((s, v) => s + v, 0)
    const width = area / skLen // stroke width in pixels
    const graph = contract(cleanGraph(sk, W, H, width * 1.1), width * 1.5)
    let strokes = strokesOf(graph, width * 1.2)
    const ov = overrides[g.ch] || {}

    // direction: from the loop outwards; with no loop, from the lower left
    strokes = strokes.map((s, i) => {
      let pts = s.pts
      const a = pts[0], b = pts[pts.length - 1]
      let rev = false
      if (s.loopEnd && !s.loopStart) rev = true
      else if (!s.loopStart && !s.closed && b[0] - b[1] < a[0] - a[1]) rev = true
      if ((ov.reverse || []).includes(i)) rev = !rev
      if (rev) pts = [...pts].reverse()
      if (!s.closed) pts = extend(pts, width * 0.35)
      return pts
    })
    if (ov.order) strokes = ov.order.map((i) => strokes[i])
    else strokes.sort((p, q) => p[0][0] - q[0][0])

    // pixels -> box units, smooth, resample
    const cx = (g.minX + g.maxX) / 2
    const toBox = (p) => [BOX / 2 + ((p[0] - pad) / sPx + g.minX - cx) * sBox, yOff + (gMaxY - (g.maxY - (p[1] - pad) / sPx)) * sBox]
    const final = strokes.map((pts) => {
      const closed = Math.hypot(pts[0][0] - pts[pts.length - 1][0], pts[0][1] - pts[pts.length - 1][1]) < 1.5
      const sm = smooth(smooth(pts, Math.round(width * 0.45), closed), Math.round(width * 0.3), closed)
      return resample(sm.map(toBox), STEP).map((p) => [+p[0].toFixed(1), +p[1].toFixed(1)])
    })
    const parts = []
    final.forEach((pts, si) => {
      const L = len(pts)
      const count = ov.parts?.[si] ?? (L > 150 ? 3 : L > 60 ? 2 : 1)
      const cuts = Array.isArray(count) ? count : splitPoints(pts, count)
      let from = 0
      for (const c of [...cuts, pts.length - 1]) parts.push({ stroke: si, from, to: c }), (from = c)
    })
    out.letters[g.ch] = { id: g.id, strokes: final, parts }
    cells.push({ g, img, W, H, strokes, graph })
    console.log(`${g.id} ${g.ch}  strokes ${final.length} (${final.map((s) => Math.round(len(s))).join(', ')})  parts ${parts.length}  nodes ${graph.nodes.length} edges ${graph.edges.length}`)
  }

  if (!only) {
    fs.mkdirSync(path.dirname(OUT), { recursive: true })
    fs.writeFileSync(OUT, JSON.stringify(out).replace(/"(.)":\{"id"/gu, '\n"$1":{"id"') + '\n')
    console.log(`wrote ${path.relative(ROOT, OUT)} (${fs.statSync(OUT).size} bytes, ${Object.keys(out.letters).length} letters)`)
  }
  if (wantPng) sheet(out, cells)
}

// Debug sheet drawn from the final box-unit data (what the app will show), over the glyph raster.
function sheet(out, cells) {
  const CELL = only ? 600 : 300, COLS = Math.min(7, cells.length), ROWS = Math.ceil(cells.length / COLS)
  const W = CELL * COLS, H = CELL * ROWS
  const rgb = Buffer.alloc(W * H * 3, 255)
  const put = (x, y, c) => {
    x = Math.round(x)
    y = Math.round(y)
    if (x < 0 || y < 0 || x >= W || y >= H) return
    rgb[(y * W + x) * 3] = c[0]
    rgb[(y * W + x) * 3 + 1] = c[1]
    rgb[(y * W + x) * 3 + 2] = c[2]
  }
  const dot = (x, y, r, c) => {
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (dx * dx + dy * dy <= r * r) put(x + dx, y + dy, c)
  }
  cells.forEach((cell, n) => {
    const ox = (n % COLS) * CELL, oy = Math.floor(n / COLS) * CELL
    const k = CELL / BOX
    const data = out.letters[cell.g.ch]
    // glyph in grey: place the raster using the same mapping as the strokes (bbox of strokes ~ bbox of glyph)
    const xs = data.strokes.flat().map((p) => p[0]), ys = data.strokes.flat().map((p) => p[1])
    const bx = (Math.min(...xs) + Math.max(...xs)) / 2, by = (Math.min(...ys) + Math.max(...ys)) / 2
    const sc = (k * (Math.max(...ys) - Math.min(...ys) + 0.001)) / (cell.H - 12) // box px per raster px (approx.)
    for (let y = 0; y < cell.H; y++) for (let x = 0; x < cell.W; x++) if (cell.img[y * cell.W + x]) put(ox + bx * k + (x - cell.W / 2) * sc, oy + by * k + (y - cell.H / 2) * sc, [215, 215, 215])
    for (let i = 0; i < CELL; i++) put(ox + i, oy, [180, 180, 255]), put(ox, oy + i, [180, 180, 255]), i % 4 < 2 && put(ox + i, oy + out.baseline * k, [255, 190, 190])
    const total = data.strokes.reduce((s, p) => s + p.length, 0)
    let seenPts = 0
    data.strokes.forEach((pts, si) => {
      pts.forEach((p, i) => {
        const u = (seenPts + i) / total
        const c = [Math.round(230 * u), Math.round(170 * (1 - u)), 30]
        if (i) for (let s = 0; s <= 6; s++) dot(ox + (pts[i - 1][0] + ((p[0] - pts[i - 1][0]) * s) / 6) * k, oy + (pts[i - 1][1] + ((p[1] - pts[i - 1][1]) * s) / 6) * k, 1, c)
      })
      seenPts += pts.length
      dot(ox + pts[0][0] * k, oy + pts[0][1] * k, 5 - Math.min(2, si), [20, 60, 230])
    })
    for (const part of data.parts.slice(1)) {
      const p = data.strokes[part.stroke][part.from]
      if (part.from) dot(ox + p[0] * k, oy + p[1] * k, 3, [0, 0, 0])
    }
  })
  const file = path.join(ROOT, 'tmp', 'strokes', 'sheet.png')
  writePng(file, W, H, rgb)
  console.log(`wrote ${path.relative(ROOT, file)}`)
}

main()
