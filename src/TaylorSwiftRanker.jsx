import { useState, useRef, useCallback, useEffect } from "react";

const ALBUMS = [
  { id:"ts",        name:"Taylor Swift",                  short:"TS",   year:2006, bg:"#B8965A", emoji:"🌟", tracks:["Tim McGraw","Picture to Burn","Teardrops on My Guitar","A Place in This World","Cold as You","The Outside","Tied Together with a Smile","Stay Beautiful","Should've Said No","Mary's Song (Oh My My My)","Our Song","I'm Only Me When I'm with You","Invisible","A Perfectly Good Heart"] },
  { id:"fearless",  name:"Fearless",                      short:"FL",   year:2008, bg:"#C9932A", emoji:"🏆", tracks:["Fearless","Fifteen","Love Story","Hey Stephen","White Horse","You Belong with Me","Breathe","Tell Me Why","You're Not Sorry","The Way I Loved You","Forever & Always","The Best Day","Change","Jump Then Fall","Untouchable","Come In with the Rain","SuperStar","The Other Side of the Door"] },
  { id:"speaknow",  name:"Speak Now",                     short:"SN",   year:2010, bg:"#7B3FA0", emoji:"🔮", tracks:["Mine","Sparks Fly","Back to December","Speak Now","Dear John","Mean","The Story of Us","Never Grow Up","Enchanted","Better than Revenge","Innocent","Haunted","Last Kiss","Long Live","Ours","Superman","If This Was a Movie"] },
  { id:"red",       name:"Red",                           short:"RED",  year:2012, bg:"#A61C1C", emoji:"🍂", tracks:["State of Grace","Red","Treacherous","I Knew You Were Trouble","All Too Well","22","I Almost Do","We Are Never Ever Getting Back Together","Stay Stay Stay","The Last Time","Holy Ground","Sad Beautiful Tragic","The Lucky One","Everything Has Changed","Starlight","Begin Again","The Moment I Knew","Come Back...Be Here","Girl at Home","Better Man","Babe","Message in a Bottle","I Bet You Think About Me","Forever Winter","Run","The Very First Night","All Too Well (10 Minute Version)"] },
  { id:"1989",      name:"1989",                          short:"1989", year:2014, bg:"#5A9CB5", emoji:"📷", tracks:["Welcome to New York","Blank Space","Style","Out of the Woods","All You Had to Do Was Stay","Shake It Off","I Wish You Would","Bad Blood","Wildest Dreams","How You Get the Girl","This Love","Clean","Wonderland","You Are in Love","New Romantics","Now That We Don't Talk","Say Don't Go","Don't Say It's Love","Suburban Legends","Is It Over Now?"] },
  { id:"rep",       name:"Reputation",                    short:"REP",  year:2017, bg:"#222222", emoji:"🐍", tracks:["...Ready for It?","End Game","I Did Something Bad","Don't Blame Me","Delicate","Look What You Made Me Do","So It Goes...","Gorgeous","Getaway Car","King of My Heart","Dancing with Our Hands Tied","Dress","This Is Why We Can't Have Nice Things","Call It What You Want","New Year's Day"] },
  { id:"lover",     name:"Lover",                         short:"LVR",  year:2019, bg:"#C4547A", emoji:"🦋", tracks:["I Forgot That You Existed","Cruel Summer","Lover","The Man","The Archer","I Think He Knows","Miss Americana & the Heartbreak Prince","Paper Rings","Cornelia Street","Death By a Thousand Cuts","London Boy","Soon You'll Get Better","False God","You Need to Calm Down","Afterglow","Me!","It's Nice to Have a Friend","Daylight"] },
  { id:"folklore",  name:"Folklore",                      short:"FLK",  year:2020, bg:"#555A60", emoji:"🌲", tracks:["the 1","cardigan","the last great american dynasty","exile","my tears ricochet","mirrorball","seven","august","this is me trying","illicit affairs","invisible string","mad woman","epiphany","betty","peace","hoax","the lakes"] },
  { id:"evermore",  name:"Evermore",                      short:"EVR",  year:2020, bg:"#6B3C20", emoji:"🍄", tracks:["willow","champagne problems","gold rush","'tis the damn season","tolerate it","no body no crime","happiness","dorothea","coney island","ivy","cowboy like me","long story short","marjorie","closure","evermore","right where you left me","it's time to go"] },
  { id:"midnights", name:"Midnights",                     short:"MID",  year:2022, bg:"#1A1E4A", emoji:"🌙", tracks:["Lavender Haze","Maroon","Anti-Hero","Snow on the Beach","Midnight Rain","Question...?","Vigilante Shit","Bejeweled","Labyrinth","Karma","Sweet Nothing","Mastermind","The Great War","Bigger Than the Whole Sky","Paris","High Infidelity","Glitch","Would've Could've Should've","Dear Reader","Hits Different","Snow on the Beach (More Lana Del Rey Version)","Karma (feat. Ice Spice)"] },
  { id:"ttpd",      name:"The Tortured Poets Department", short:"TTPD", year:2024, bg:"#3A3530", emoji:"🖊️", tracks:["Fortnight","The Tortured Poets Department","My Boy Only Breaks His Favorite Toys","Down Bad","So Long, London","But Daddy I Love Him","Fresh Out the Slammer","Florida!!!","Guilty as Sin?","Who's Afraid of Little Old Me?","I Can Fix Him (No Really I Can)","loml","I Can Do It with a Broken Heart","The Smallest Man Who Ever Lived","The Alchemy","Clara Bow","The Black Dog","imgonnagetyouback","The Albatross","Chloe or Sam or Sophia or Marcus","How Did It End?","So High School","I Hate It Here","thanK you aIMee","I Look in People's Windows","The Prophecy","Cassandra","Peter","The Bolter","Robin","The Manuscript"] },
  { id:"showgirl",  name:"The Life of a Showgirl",        short:"LAS",  year:2025, bg:"#8B1A1A", emoji:"🎭", tracks:["The Fate of Ophelia","Elizabeth Taylor","Wood","Father Figure","Eldest Daughter","Ruin the Friendship","Actually Romantic","Wi$h Li$t","Opalite","Cancelled!","Honey","The Life of a Showgirl"] },
];

const albumMap = Object.fromEntries(ALBUMS.map((a) => [a.id, a]));
const songAlbumMap = {};
ALBUMS.forEach((a) => a.tracks.forEach((t) => (songAlbumMap[t] = a.id)));

// ── localStorage helpers ──────────────────────────────────────────────────────
const LS_RANKINGS  = "ts_rankings";
const LS_FAVORITES = "ts_favorites";

function buildDefaultRankings() {
  const list = [];
  ALBUMS.forEach((a) => a.tracks.forEach((t) => list.push({ albumId: a.id, song: t })));
  return list;
}

function loadRankings() {
  try {
    const raw = localStorage.getItem(LS_RANKINGS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return buildDefaultRankings();
}

function saveRankings(rankings) {
  try { localStorage.setItem(LS_RANKINGS, JSON.stringify(rankings)); } catch {}
}

function loadFavorites() {
  try {
    return new Set(JSON.parse(localStorage.getItem(LS_FAVORITES) || "[]"));
  } catch {}
  return new Set();
}

function saveFavorites(favorites) {
  try { localStorage.setItem(LS_FAVORITES, JSON.stringify([...favorites])); } catch {}
}

// ── Shared style tokens ───────────────────────────────────────────────────────
const SERIF = "'Playfair Display', Georgia, serif";
const SANS  = "'DM Sans', system-ui, sans-serif";

// ── Album badge ───────────────────────────────────────────────────────────────
function AlbumBadge({ alb, size }) {
  const cfg = {
    chip: { outer: 40, emoji: 17, yearSize: 8,  radius: 8,  gap: 1 },
    hero: { outer: 72, emoji: 28, yearSize: 10, radius: 12, gap: 4 },
    dot:  { outer: 28, emoji: 13, yearSize: 0,  radius: 6,  gap: 1 },
  }[size];

  return (
    <div style={{
      width: cfg.outer, height: cfg.outer, borderRadius: cfg.radius,
      background: alb.bg, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: cfg.gap, flexShrink: 0, padding: 3,
    }}>
      <span style={{ fontSize: cfg.emoji, lineHeight: 1 }}>{alb.emoji}</span>
      {cfg.yearSize > 0 && (
        <span style={{
          fontSize: cfg.yearSize, fontWeight: 500, color: "#fff",
          opacity: 0.75, letterSpacing: "0.04em", fontFamily: SANS,
        }}>
          {alb.year}
        </span>
      )}
    </div>
  );
}

// ── Drag + jump hook ──────────────────────────────────────────────────────────
function useSortableList(items, onChange) {
  const dragSrcIdx = useRef(null);
  const [overIdx, setOverIdx] = useState(null);

  const move = useCallback((fromIdx, toIdx) => {
    if (fromIdx === toIdx) return;
    const next = [...items];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    onChange(next);
  }, [items, onChange]);

  const onDragStart = useCallback((i) => { dragSrcIdx.current = i; }, []);
  const onDragOver  = useCallback((i) => { if (dragSrcIdx.current !== null) setOverIdx(i); }, []);
  const onDrop      = useCallback((i) => {
    if (dragSrcIdx.current !== null) move(dragSrcIdx.current, i);
    dragSrcIdx.current = null;
    setOverIdx(null);
  }, [move]);
  const onDragEnd   = useCallback(() => { dragSrcIdx.current = null; setOverIdx(null); }, []);
  const jumpTo      = useCallback((fromIdx, oneBased) => {
    move(fromIdx, Math.max(0, Math.min(oneBased - 1, items.length - 1)));
  }, [move, items.length]);

  return { dragSrcIdx, overIdx, onDragStart, onDragOver, onDrop, onDragEnd, jumpTo };
}

// ── Song row ──────────────────────────────────────────────────────────────────
function SongRow({
  song, albumId, num, total, showSub, flash,
  favorites, onToggleFav,
  onDragStart, onDragOver, onDrop, onDragEnd, onJump,
  isDragSrc, isDragOver,
}) {
  const alb   = albumMap[albumId];
  const isFav = favorites.has(song);
  const [hovered,  setHovered]  = useState(false);
  const [inputVal, setInputVal] = useState(String(num));

  useEffect(() => { setInputVal(String(num)); }, [num]);

  function commitJump() {
    const n = parseInt(inputVal, 10);
    if (!isNaN(n) && n >= 1 && n <= total) onJump(n);
    else setInputVal(String(num));
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => { e.preventDefault(); onDragOver(); }}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setInputVal(String(num)); }}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 20px",
        borderBottom: "0.5px solid #f0f0f0",
        borderLeft: isDragOver ? "2.5px solid #111" : "2.5px solid transparent",
        background: flash ? "#fef9ec" : isDragOver || hovered ? "#fafafa" : "#fff",
        opacity: isDragSrc ? 0.25 : 1,
        cursor: "grab", userSelect: "none",
        transition: "background 0.12s, border-left-color 0.12s",
        fontFamily: SANS,
      }}
    >
      {/* Rank / jump input */}
      <div style={{ width: 52, display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
        {hovered ? (
          <input
            type="number"
            value={inputVal}
            min={1}
            max={total}
            onChange={(e) => setInputVal(e.target.value)}
            onClick={(e) => e.target.select()}
            onKeyDown={(e) => {
              if (e.key === "Enter")  { e.preventDefault(); commitJump(); }
              if (e.key === "Escape") { setInputVal(String(num)); }
            }}
            onBlur={commitJump}
            style={{
              width: 36, textAlign: "right",
              fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: "#111",
              border: "none", borderBottom: "1px solid #bbb",
              background: "transparent", outline: "none", padding: "0 2px",
            }}
            aria-label="Jump to position"
          />
        ) : (
          <span style={{
            fontFamily: SERIF, fontStyle: "italic", fontSize: 13,
            color: "#bbb", minWidth: 20, textAlign: "right",
          }}>
            {num}
          </span>
        )}
      </div>

      {alb && <AlbumBadge alb={alb} size="dot" />}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, color: "#111",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {song}
        </div>
        {showSub && alb && (
          <div style={{
            fontSize: 11, color: "#bbb", marginTop: 1,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            letterSpacing: "0.02em",
          }}>
            {alb.name} · {alb.year}
          </div>
        )}
      </div>

      <span style={{ fontSize: 14, color: hovered ? "#ccc" : "#eee", flexShrink: 0, transition: "color 0.12s" }}>
        ⠿
      </span>

      <button
        onClick={() => onToggleFav(song)}
        aria-label={isFav ? `Unfavorite ${song}` : `Favorite ${song}`}
        style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 16, color: isFav ? "#d4a017" : "#ddd",
          padding: 4, lineHeight: 1, flexShrink: 0, transition: "color 0.1s",
        }}
      >
        {isFav ? "★" : "☆"}
      </button>
    </div>
  );
}

// ── Sortable list wrapper ─────────────────────────────────────────────────────
function SortableSongList({ items, setItems, favorites, onToggleFav, showSub }) {
  const [flashIdx, setFlashIdx] = useState(null);

  const { dragSrcIdx, overIdx, onDragStart, onDragOver, onDrop, onDragEnd, jumpTo } =
    useSortableList(items, setItems);

  function handleJump(fromIdx, toPos) {
    const toIdx = Math.max(0, Math.min(toPos - 1, items.length - 1));
    jumpTo(fromIdx, toPos);
    setFlashIdx(toIdx);
    setTimeout(() => setFlashIdx(null), 600);
  }

  return (
    <div>
      {items.map((item, i) => (
        <SongRow
          key={item.song}
          song={item.song}
          albumId={item.albumId}
          num={i + 1}
          total={items.length}
          showSub={showSub}
          flash={flashIdx === i}
          favorites={favorites}
          onToggleFav={onToggleFav}
          onDragStart={() => onDragStart(i)}
          onDragOver={() => onDragOver(i)}
          onDrop={() => onDrop(i)}
          onDragEnd={onDragEnd}
          onJump={(toPos) => handleJump(i, toPos)}
          isDragSrc={dragSrcIdx.current === i}
          isDragOver={overIdx === i && dragSrcIdx.current !== i}
        />
      ))}
    </div>
  );
}

// ── Hint text ─────────────────────────────────────────────────────────────────
function Hint() {
  return (
    <p style={{
      fontSize: 10, color: "#bbb", letterSpacing: "0.03em",
      padding: "6px 20px 2px", fontFamily: SANS,
    }}>
      Drag to reorder · hover &amp; type a number · press Enter to jump
    </p>
  );
}

// ── Albums tab ────────────────────────────────────────────────────────────────
function AlbumsTab({ rankings, setRankings, favorites, onToggleFav }) {
  const [currentId, setCurrentId] = useState(ALBUMS[0].id);

  const albumItems = rankings
    .filter((r) => r.albumId === currentId)
    .map((r) => ({ albumId: r.albumId, song: r.song }));

  function setAlbumItems(newItems) {
    setRankings((prev) => {
      const indices = prev.reduce((acc, r, i) => {
        if (r.albumId === currentId) acc.push(i);
        return acc;
      }, []);
      const next = [...prev];
      indices.forEach((gi, li) => { next[gi] = { albumId: currentId, song: newItems[li].song }; });
      return next;
    });
  }

  const alb = albumMap[currentId];

  return (
    <div>
      {/* Album chip scroller */}
      <div style={{
        display: "flex", gap: 6, padding: "14px 20px",
        overflowX: "auto", borderBottom: "0.5px solid #f0f0f0",
        background: "#fafafa",
      }}>
        {ALBUMS.map((a) => (
          <div
            key={a.id}
            onClick={() => setCurrentId(a.id)}
            title={a.name}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 5, cursor: "pointer", flexShrink: 0,
              opacity: a.id === currentId ? 1 : 0.4,
              transition: "opacity 0.15s",
            }}
          >
            <div style={{
              outline: a.id === currentId ? "2px solid #111" : "none",
              outlineOffset: 2, borderRadius: 9,
            }}>
              <AlbumBadge alb={a} size="chip" />
            </div>
            <span style={{
              fontSize: 9, fontFamily: SANS,
              color: a.id === currentId ? "#111" : "#999",
              fontWeight: a.id === currentId ? 500 : 400,
              maxWidth: 44, textAlign: "center",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {a.name.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Hero */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "20px 20px 16px", borderBottom: "0.5px solid #f0f0f0",
      }}>
        <AlbumBadge alb={alb} size="hero" />
        <div>
          <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 400, color: "#111", lineHeight: 1.2 }}>
            {alb.name}
          </div>
          <div style={{ fontSize: 12, color: "#bbb", marginTop: 4, letterSpacing: "0.03em", fontFamily: SANS }}>
            {alb.year}
          </div>
          <span style={{
            marginTop: 7, display: "inline-block", fontSize: 10,
            letterSpacing: "0.05em", textTransform: "uppercase",
            padding: "3px 9px", borderRadius: 99,
            border: "0.5px solid #e5e5e5", color: "#999", fontFamily: SANS,
          }}>
            {albumItems.length} tracks
          </span>
        </div>
      </div>

      <Hint />
      <SortableSongList
        items={albumItems}
        setItems={setAlbumItems}
        favorites={favorites}
        onToggleFav={onToggleFav}
        showSub={false}
      />
    </div>
  );
}

// ── Rankings tab ──────────────────────────────────────────────────────────────
function RankingsTab({ rankings, setRankings, favorites, onToggleFav, onReset }) {
  const [search, setSearch] = useState("");

  const allItems = rankings.map((r) => ({ albumId: r.albumId, song: r.song }));
  const filtered = search
    ? allItems.filter((r) => r.song.toLowerCase().includes(search.toLowerCase()))
    : allItems;

  function setFilteredItems(newFiltered) {
    if (!search) {
      setRankings(newFiltered);
      return;
    }
    setRankings((prev) => {
      const next = [...prev];
      const idxs = prev.reduce((acc, r, i) => {
        if (r.song.toLowerCase().includes(search.toLowerCase())) acc.push(i);
        return acc;
      }, []);
      idxs.forEach((gi, li) => { next[gi] = newFiltered[li]; });
      return next;
    });
  }

  return (
    <div>
      {/* Search bar */}
      <div style={{
        display: "flex", gap: 8, alignItems: "center",
        padding: "12px 20px", borderBottom: "0.5px solid #f0f0f0",
      }}>
        <span style={{ fontSize: 15, color: "#bbb" }}>⌕</span>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search songs…"
          aria-label="Search songs"
          style={{
            flex: 1, fontSize: 13, background: "none",
            border: "none", outline: "none", color: "#111", fontFamily: SANS,
          }}
        />
        <button
          onClick={() => { onReset(); setSearch(""); }}
          style={{
            fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase",
            padding: "4px 10px", border: "0.5px solid #e5e5e5", borderRadius: 8,
            background: "none", color: "#999", cursor: "pointer", fontFamily: SANS,
          }}
        >
          Reset
        </button>
      </div>

      <div style={{
        fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase",
        color: "#bbb", padding: "9px 20px", borderBottom: "0.5px solid #f0f0f0",
        fontFamily: SANS,
      }}>
        {filtered.length} songs{search ? ` for "${search}"` : ""}
      </div>

      <Hint />
      <SortableSongList
        items={filtered}
        setItems={setFilteredItems}
        favorites={favorites}
        onToggleFav={onToggleFav}
        showSub={true}
      />
    </div>
  );
}

// ── Favorites tab ─────────────────────────────────────────────────────────────
function FavoritesTab({ rankings, favorites, onToggleFav }) {
  const favItems = rankings
    .filter((r) => favorites.has(r.song))
    .map((r) => ({ albumId: r.albumId, song: r.song }));

  if (!favItems.length) {
    return (
      <div style={{ padding: 52, textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 10, opacity: 0.35 }}>☆</div>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: "#aaa" }}>
          Star songs to save your favorites
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase",
        color: "#bbb", padding: "9px 20px", borderBottom: "0.5px solid #f0f0f0",
        fontFamily: SANS,
      }}>
        {favItems.length} starred — ordered by your rankings
      </div>
      {favItems.map((item, i) => (
        <SongRow
          key={item.song}
          song={item.song} albumId={item.albumId} num={i + 1} total={favItems.length}
          showSub={true} flash={false}
          favorites={favorites} onToggleFav={onToggleFav}
          onDragStart={() => {}} onDragOver={() => {}} onDrop={() => {}}
          onDragEnd={() => {}} onJump={() => {}}
          isDragSrc={false} isDragOver={false}
        />
      ))}
    </div>
  );
}

// ── Root component ────────────────────────────────────────────────────────────
export default function TaylorSwiftRanker() {
  const [tab,       setTab]       = useState("albums");
  const [rankings,  setRankings]  = useState(loadRankings);
  const [favorites, setFavorites] = useState(loadFavorites);

  // Persist rankings to localStorage on every change
  function updateRankings(next) {
    const value = typeof next === "function" ? next(rankings) : next;
    setRankings(value);
    saveRankings(value);
  }

  // Persist favorites to localStorage on every change
  function toggleFav(song) {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(song) ? next.delete(song) : next.add(song);
      saveFavorites(next);
      return next;
    });
  }

  const TABS = [
    { id: "albums",    label: "Albums"    },
    { id: "rankings",  label: "Rankings"  },
    { id: "favorites", label: "Favorites" },
  ];

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap');`}</style>

      <div style={{
        fontFamily: SANS, maxWidth: 680, margin: "0 auto",
        border: "0.5px solid #e5e5e5", borderRadius: 12,
        overflow: "hidden", background: "#fff",
        boxShadow: "0 2px 24px rgba(0,0,0,0.06)",
      }}>
        {/* Top bar */}
        <div style={{
          padding: "18px 20px 14px", borderBottom: "0.5px solid #f0f0f0",
          display: "flex", alignItems: "baseline", gap: 12,
        }}>
          <span style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 400, fontStyle: "italic", color: "#111" }}>
            Taylor Swift
          </span>
          {favorites.size > 0 && (
            <span style={{
              fontSize: 11, color: "#bbb", letterSpacing: "0.06em",
              textTransform: "uppercase", marginLeft: "auto", fontFamily: SANS,
            }}>
              {favorites.size} starred
            </span>
          )}
        </div>

        {/* Nav */}
        <div style={{ display: "flex", borderBottom: "0.5px solid #f0f0f0" }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1, padding: "11px 6px", border: "none", background: "none",
                cursor: "pointer", fontFamily: SANS, fontSize: 11,
                letterSpacing: "0.05em", textTransform: "uppercase",
                color: tab === t.id ? "#111" : "#bbb",
                borderBottom: tab === t.id ? "1.5px solid #111" : "1.5px solid transparent",
                transition: "color 0.15s, border-color 0.15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Panels */}
        {tab === "albums" && (
          <AlbumsTab
            rankings={rankings} setRankings={updateRankings}
            favorites={favorites} onToggleFav={toggleFav}
          />
        )}
        {tab === "rankings" && (
          <RankingsTab
            rankings={rankings} setRankings={updateRankings}
            favorites={favorites} onToggleFav={toggleFav}
            onReset={() => updateRankings(buildDefaultRankings())}
          />
        )}
        {tab === "favorites" && (
          <FavoritesTab
            rankings={rankings}
            favorites={favorites} onToggleFav={toggleFav}
          />
        )}
      </div>
    </>
  );
}
