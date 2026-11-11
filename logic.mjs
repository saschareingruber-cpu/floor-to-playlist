export function cleanArtists(values) {
  if (!Array.isArray(values)) throw new Error('Artists müssen eine Liste sein.');
  const seen = new Set();
  return values.filter(v => typeof v === 'string').map(v => v.trim()).filter(v => {
    const key = v.toLocaleLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Round-robin: erst ein Track pro Artist, anschließend die nächste Runde.
export function selectTracks(groups, target = 30) {
  const limit = Math.max(target, groups.length);
  const selected = [], seen = new Set();
  const positions = groups.map(() => 0);
  const rounds = Math.max(0, ...groups.map(g => g.tracks.length));
  for (let round = 0; round < rounds && selected.length < limit; round++) {
    for (const [index,group] of groups.entries()) {
      // Shared top tracks must not prevent the next artist getting a turn.
      while (positions[index] < group.tracks.length && seen.has(group.tracks[positions[index]].uri)) positions[index]++;
      const track = group.tracks[positions[index]++];
      if (track && !seen.has(track.uri)) {
        seen.add(track.uri);
        selected.push(track);
        if (selected.length === limit) break;
      }
    }
  }
  return selected;
}

export function matchingArtists(name, candidates) {
  const normalize = s => s.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
  return candidates.filter(a => normalize(a.name) === normalize(name));
}
