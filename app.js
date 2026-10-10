/* Luce — front-end logic (English source code, bilingual EN/IT UI).
   No build step. TMDB API + localStorage. No accounts. */
(function () {
  "use strict";

  /* ---------- i18n dictionary (English source, Italian translation) ---------- */
  var STR = {
    en: {
      tagline: "movies we watched",
      searchPh: "Title, director, actor or year… e.g. 1980",
      modeAll: "All", modeTitle: "Title", modeDirector: "Director", modeActor: "Actor", modeYear: "Year",
      trending: "Trending", showMore: "Show more ↓",
      sortPop: "Most popular", sortVote: "Top rated",
      myWatched: "My watched", filterPh: "Filter: title, director, actor, note…",
      yearAll: "Year: all", ratingAll: "Rating: all", withNotes: "With notes",
      exportJson: "⬇ Export JSON", importJson: "⬆ Import JSON",
      watchlist: "Watchlist", tabSearch: "Search", tabWatched: "Watched", tabWatchlist: "Watchlist",
      keyHelp: "Free from themoviedb.org → Settings → API (v3 key). It stays in your browser only, never in the repo.",
      keyPh: "Paste your v3 key here…", close: "Close", save: "Save",
      needKey: "Add your free TMDB key to search.",
      howKey: "Tap ⚙ and paste your TMDB v3 key (free at themoviedb.org).",
      popularNow: "Popular right now — or try “1980”, “Kubrick”, “Shining”.",
      yearFilms: "films",
      seeYear: function (y) { return "See every movie from " + y + " →"; },
      directedBy: function (n) { return "Films directed by " + n + " →"; },
      starring: function (n) { return "Films starring " + n + " →"; },
      noResult: "Nothing found.",
      tryOther: "Try a year (e.g. 1980) or the original title.",
      emptyWatched: "Nothing marked yet.",
      emptyWatchedSub: "Tap a poster, then “Watched”.",
      discover: "Discover movies",
      emptyWl: "Your watchlist is empty.",
      emptyWlSub: "Tap a poster, then “Watchlist”.",
      watched: "✓ Watched", watchlistBtn: "+ Watchlist", inList: "✓ In list",
      directedByLbl: "Director", castLbl: "Cast", runtimeLbl: "Runtime", min: "min",
      noOverview: "No synopsis available.",
      myThoughts: "My thoughts",
      howWasIt: "How was it? Write your thoughts…",
      watchedOn: "Watched on", spoiler: "Contains spoilers", rewatch: "Would rewatch",
      saved: "Saved ✓",
      markUndone: "Undo",
      markedWatched: "Marked as watched ✓",
      markedWl: "Added to watchlist ✓",
      removed: "Removed.",
      rating: "Rating",
      exportDone: "Exported ✓", importDone: "Imported ✓", importFail: "Invalid file.",
      keySaved: "Key saved ✓", keyMissing: "Paste a key first.",
      andMore: function (n) { return "+ " + n + " more"; }
    },
    it: {
      tagline: "i film che abbiamo visto",
      searchPh: "Titolo, regista, attore o anno… es. 1980",
      modeAll: "Tutto", modeTitle: "Titolo", modeDirector: "Regista", modeActor: "Attore", modeYear: "Anno",
      trending: "Di tendenza", showMore: "Mostra altri ↓",
      sortPop: "Più popolari", sortVote: "Più votati",
      myWatched: "I miei visti", filterPh: "Filtra: titolo, regista, attore, nota…",
      yearAll: "Anno: tutti", ratingAll: "Voto: tutti", withNotes: "Con note",
      exportJson: "⬇ Esporta JSON", importJson: "⬆ Importa JSON",
      watchlist: "Da vedere", tabSearch: "Cerca", tabWatched: "Visti", tabWatchlist: "Da vedere",
      keyHelp: "Gratis da themoviedb.org → Impostazioni → API (chiave v3). Resta solo nel tuo browser, mai nel repo.",
      keyPh: "Incolla qui la chiave v3…", close: "Chiudi", save: "Salva",
      needKey: "Aggiungi la tua chiave TMDB gratuita per cercare.",
      howKey: "Tocca ⚙ e incolla la chiave TMDB v3 (gratis su themoviedb.org).",
      popularNow: "Popolari ora — oppure prova “1980”, “Kubrick”, “Shining”.",
      yearFilms: "film",
      seeYear: function (y) { return "Vedi tutti i film del " + y + " →"; },
      directedBy: function (n) { return "Film diretti da " + n + " →"; },
      starring: function (n) { return "Film con " + n + " →"; },
      noResult: "Nessun risultato.",
      tryOther: "Prova con un anno (es. 1980) o il titolo originale.",
      emptyWatched: "Non hai ancora segnato nulla.",
      emptyWatchedSub: "Tocca una locandina, poi “Visto”.",
      discover: "Scopri film",
      emptyWl: "La watchlist è vuota.",
      emptyWlSub: "Tocca una locandina, poi “Da vedere”.",
      watched: "✓ Visto", watchlistBtn: "+ Da vedere", inList: "✓ In lista",
      directedByLbl: "Regia", castLbl: "Cast", runtimeLbl: "Durata", min: "min",
      noOverview: "Nessuna trama disponibile.",
      myThoughts: "Le mie impressioni",
      howWasIt: "Com'è stato? Scrivi le tue impressioni…",
      watchedOn: "Visto il", spoiler: "Contiene spoiler", rewatch: "Lo rivedrei",
      saved: "Salvato ✓",
      markUndone: "Annulla",
      markedWatched: "Segnato come visto ✓",
      markedWl: "Aggiunto a Da vedere ✓",
      removed: "Rimosso.",
      rating: "Voto",
      exportDone: "Esportato ✓", importDone: "Importato ✓", importFail: "File non valido.",
      keySaved: "Chiave salvata ✓", keyMissing: "Incolla prima una chiave.",
      andMore: function (n) { return "+ altri " + n; }
    }
  };

  /* ---------- tiny store ---------- */
  var LS_DATA = "luci.v1", LS_KEY = "luci.tmdbKey", LS_LANG = "luci.lang";
  function readLS(k, fb) { try { var v = localStorage.getItem(k); return v === null ? fb : v; } catch (e) { return fb; } }
  function writeLS(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function loadData() { try { return JSON.parse(readLS(LS_DATA, "{}")) || {}; } catch (e) { return {}; } }
  function saveData(d) { writeLS(LS_DATA, JSON.stringify(d)); }

  var lang = readLS(LS_LANG, ((navigator.language || "en").toLowerCase().indexOf("it") === 0) ? "it" : "en");
  if (lang !== "it" && lang !== "en") lang = "en";
  function t(k) { return STR[lang][k] !== undefined ? STR[lang][k] : STR.en[k]; }

  function getKey() {
    var k = (readLS(LS_KEY, "") || "").trim();
    if (!k && typeof window.LUCI_TMDB_KEY === "string") k = window.LUCI_TMDB_KEY.trim();
    return k;
  }

  /* ---------- TMDB client ---------- */
  var API = "https://api.themoviedb.org/3", IMG = "https://image.tmdb.org/t/p/";
  function poster(path, size) { return path ? IMG + (size || "w342") + path : ""; }
  function req(path, params) {
    var key = getKey();
    if (!key) return Promise.reject(new Error("no-key"));
    params = params || {};
    params.api_key = key;
    params.language = lang === "it" ? "it-IT" : "en-US";
    var qs = Object.keys(params).map(function (k) { return encodeURIComponent(k) + "=" + encodeURIComponent(params[k]); }).join("&");
    return fetch(API + path + "?" + qs).then(function (r) {
      if (!r.ok) throw new Error("tmdb-" + r.status);
      return r.json();
    });
  }
  var api = {
    trending: function (page) { return req("/trending/movie/week", { page: page || 1 }); },
    searchMovie: function (q, page) { return req("/search/movie", { query: q, page: page || 1, include_adult: "false" }); },
    searchPerson: function (q) { return req("/search/person", { query: q }); },
    discoverYear: function (y, page, sort) {
      return req("/discover/movie", { primary_release_year: y, page: page || 1, sort_by: sort || "popularity.desc", include_adult: "false", "vote_count.gte": 5 });
    },
    discoverPerson: function (id, role, page) {
      var p = { page: page || 1, sort_by: "popularity.desc", include_adult: "false" };
      if (role === "crew") p.with_crew = id; else p.with_cast = id;
      return req("/discover/movie", p);
    },
    details: function (id) {
      return req("/movie/" + id, { append_to_response: "credits" });
    }
  };

  /* ---------- state ---------- */
  var data = loadData();
  var mode = "all", query = "", results = [], persons = [];
  var page = 1, totalPages = 1, personFilter = null, sortBy = "pop";

  /* ---------- dom ---------- */
  function $(id) { return document.getElementById(id); }
  var els = {};
  ["q", "go", "grid", "empty", "more", "suggest", "personRow", "resTitle", "resCount", "sort",
   "fWatched", "fYear", "fRating", "gridWatched", "emptyWatched", "watchedCount",
   "gridWl", "emptyWl", "wlCount", "nWatched", "nWl",
   "exportBtn", "importBtn", "importFile", "settingsBtn", "settingsDlg",
   "keyInput", "saveKey", "sheetRoot", "toastRoot", "langBtn"].forEach(function (id) { els[id] = $(id); });

  /* ---------- i18n apply ---------- */
  function applyLang() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      var v = t(k);
      if (typeof v === "string") {
        if (el.tagName === "OPTION") el.textContent = v;
        else el.firstChild && el.firstChild.nodeType === 3 ? (el.childNodes[0].textContent = v) : (el.textContent = v);
      }
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      var v = t(el.getAttribute("data-i18n-ph"));
      if (typeof v === "string") el.setAttribute("placeholder", v);
    });
    els.langBtn.textContent = lang === "it" ? "EN" : "IT";
    writeLS(LS_LANG, lang);
    renderAll();
  }

  /* ---------- helpers ---------- */
  function yearOf(m) { return (m.release_date || "").slice(0, 4) || "—"; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function isYear(q) { return /^\d{4}$/.test(q.trim()); }

  function cardHTML(m) {
    var id = m.id, rec = data[id];
    var badges = "";
    if (rec && rec.watched) badges += '<i class="visto">✓' + (rec.rating ? " " + rec.rating + "★" : "") + "</i>";
    else if (rec && rec.watchlist) badges += '<i class="mio">+</i>';
    var img = m.poster_path
      ? '<img loading="lazy" src="' + poster(m.poster_path) + '" alt="' + esc(m.title) + '" />'
      : '<span class="ph">' + esc(m.title) + "</span>";
    return '<button class="card" data-id="' + id + '"><span class="poster">' + img +
      (badges ? '<span class="badge">' + badges + "</span>" : "") +
      '</span><h3>' + esc(m.title) + "</h3><p>" + esc(yearOf(m)) + "</p></button>";
  }

  function renderGrid(grid, list) { grid.innerHTML = list.map(cardHTML).join(""); }

  function sortList(list) {
    var l = list.slice();
    if (sortBy === "vote") l.sort(function (a, b) { return (b.vote_average || 0) - (a.vote_average || 0); });
    else if (sortBy === "az") l.sort(function (a, b) { return String(a.title).localeCompare(String(b.title)); });
    else l.sort(function (a, b) { return (b.popularity || 0) - (a.popularity || 0); });
    return l;
  }

  function toast(msg, undoFn) {
    els.toastRoot.innerHTML = "";
    var box = document.createElement("div");
    box.className = "toast";
    var s = document.createElement("span"); s.textContent = msg;
    box.appendChild(s);
    if (undoFn) {
      var b = document.createElement("button"); b.textContent = t("markUndone");
      b.onclick = function () { undoFn(); els.toastRoot.innerHTML = ""; };
      box.appendChild(b);
      setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 6000);
    } else {
      setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 2500);
    }
    els.toastRoot.appendChild(box);
  }

  /* ---------- search views ---------- */
  function setEmpty(box, title, sub, actionLbl, actionFn) {
    box.hidden = false;
    box.innerHTML = "<b>" + esc(title) + "</b><div>" + esc(sub) + "</div>";
    if (actionFn) {
      var b = document.createElement("button");
      b.className = "chip"; b.style.marginTop = "10px"; b.textContent = actionLbl;
      b.onclick = actionFn;
      box.appendChild(b);
    }
  }

  function renderSuggest() {
    var box = els.suggest; box.innerHTML = "";
    var q = query.trim();
    if (!q || !getKey()) { box.hidden = true; return; }
    var btns = [];
    if (isYear(q) && (mode === "all" || mode === "year")) {
      var b = document.createElement("button");
      b.textContent = t("seeYear")(q);
      b.onclick = function () { runYearSearch(q); };
      btns.push(b);
    }
    if (btns.length) { btns.forEach(function (x) { box.appendChild(x); }); box.hidden = false; }
    else box.hidden = true;
  }

  function renderPersons() {
    var row = els.personRow; row.innerHTML = "";
    if (!persons.length) { row.hidden = true; return; }
    row.hidden = false;
    persons.slice(0, 8).forEach(function (p) {
      var el = document.createElement("button");
      el.className = "person";
      var img = p.profile_path ? '<img loading="lazy" src="' + poster(p.profile_path, "w185") + '" alt="' + esc(p.name) + '" />' : "";
      el.innerHTML = img + "<b>" + esc(p.name) + "</b><small>" + esc(p.known_for_department || "") + "</small>";
      el.onclick = function () { runPersonDiscover(p); };
      row.appendChild(el);
    });
  }

  function renderResults() {
    renderSuggest();
    renderPersons();
    var list = sortList(results);
    renderGrid(els.grid, list);
    els.more.hidden = !(page < totalPages && results.length);
    var empty = els.empty;
    if (!getKey()) { setEmpty(empty, t("needKey"), t("howKey"), "⚙ TMDB key", openSettings); }
    else if (!list.length && query) { setEmpty(empty, t("noResult"), t("tryOther")); empty.hidden = false; }
    else if (!list.length) { setEmpty(empty, t("trending"), t("popularNow")); empty.hidden = false; }
    else empty.hidden = true;
  }

  function runTrending() {
    els.resTitle.textContent = t("trending");
    els.resCount.textContent = "";
    if (!getKey()) { results = []; renderResults(); return; }
    page = 1;
    api.trending(1).then(function (r) {
      results = r.results || []; totalPages = Math.min(r.total_pages || 1, 20);
      renderResults();
    }).catch(function () { results = []; renderResults(); });
  }

  function runYearSearch(y) {
    mode = "year"; syncChips();
    els.resTitle.textContent = y;
    page = 1; personFilter = null; persons = [];
    api.discoverYear(parseInt(y, 10), 1).then(function (r) {
      results = r.results || []; totalPages = Math.min(r.total_pages || 1, 50);
      els.resCount.textContent = (r.total_results || results.length) + " " + t("yearFilms");
      renderResults();
    }).catch(function () { results = []; renderResults(); });
  }

  function runPersonDiscover(p) {
    var role = (p.known_for_department === "Directing" || mode === "director") ? "crew" : "cast";
    if (mode === "director") role = "crew";
    if (mode === "actor") role = "cast";
    els.resTitle.textContent = p.name;
    page = 1; personFilter = { id: p.id, role: role, name: p.name };
    api.discoverPerson(p.id, role, 1).then(function (r) {
      results = r.results || []; totalPages = Math.min(r.total_pages || 1, 50);
      els.resCount.textContent = (r.total_results || results.length) + " " + t("yearFilms");
      renderResults();
    }).catch(function () { results = []; renderResults(); });
  }

  var debounce = null;
  function runSearch() {
    query = els.q.value || "";
    var q = query.trim();
    persons = []; personFilter = null; page = 1;
    if (!q) { runTrending(); return; }
    if (!getKey()) { results = []; renderResults(); return; }
    if ((mode === "all" || mode === "year") && isYear(q)) { runYearSearch(q); return; }
    if (mode === "year" && !isYear(q)) { results = []; els.resTitle.textContent = q; renderResults(); return; }
    if (mode === "director" || mode === "actor" || mode === "all") {
      var needPersons = (mode !== "title");
      var pSearch = needPersons ? api.searchPerson(q).catch(function () { return { results: [] }; }) : Promise.resolve({ results: [] });
      var mSearch = (mode === "all" || mode === "title")
        ? api.searchMovie(q, 1).catch(function () { return { results: [] }; })
        : Promise.resolve({ results: [], total_pages: 1 });
      Promise.all([pSearch, mSearch]).then(function (rs) {
        persons = (rs[0].results || []).slice(0, 8);
        var movies = rs[1].results || [];
        totalPages = Math.min(rs[1].total_pages || 1, 20);
        if ((mode === "director" || mode === "actor") && persons.length) {
          renderPersons(); renderSuggest();
          runPersonDiscover(persons[0]);
        } else {
          results = movies;
          els.resTitle.textContent = q;
          els.resCount.textContent = results.length ? results.length + " " + t("yearFilms") : "";
          renderResults();
        }
      });
      return;
    }
    api.searchMovie(q, 1).then(function (r) {
      results = r.results || []; totalPages = Math.min(r.total_pages || 1, 20);
      els.resTitle.textContent = q;
      els.resCount.textContent = results.length ? results.length + " " + t("yearFilms") : "";
      renderResults();
    }).catch(function () { results = []; renderResults(); });
  }

  function loadMore() {
    if (page >= totalPages) return;
    var next = page + 1;
    var q = query.trim(), done;
    if (personFilter) done = api.discoverPerson(personFilter.id, personFilter.role, next);
    else if (isYear(q) && (mode === "year" || mode === "all")) done = api.discoverYear(parseInt(q, 10), next);
    else if (q) done = api.searchMovie(q, next);
    else done = api.trending(next);
    done.then(function (r) {
      page = next;
      results = results.concat(r.results || []);
      renderResults();
    }).catch(function () {});
  }

  /* ---------- detail sheet ---------- */
  function fmtRuntime(min) {
    if (!min) return "—";
    var h = Math.floor(min / 60), m = min % 60;
    return h ? h + "h " + m + "m" : m + " " + t("min");
  }

  function openDetail(id) {
    var fromResults = results.filter(function (m) { return String(m.id) === String(id); })[0] || null;
    api.details(id).then(function (d) {
      showSheet(d);
    }).catch(function () {
      if (fromResults) showSheet({ id: fromResults.id, title: fromResults.title, poster_path: fromResults.poster_path, release_date: fromResults.release_date, overview: fromResults.overview, vote_average: fromResults.vote_average, runtime: null, credits: null, genres: [] });
    });
  }

  function showSheet(d) {
    var rec = data[d.id] || {};
    var credits = d.credits || {};
    var crew = credits.crew || [], cast = (credits.cast || []).slice(0, 6);
    var director = crew.filter(function (c) { return c.job === "Director"; }).map(function (c) { return c.name; }).join(", ");
    var root = els.sheetRoot; root.innerHTML = "";
    var scrim = document.createElement("div"); scrim.className = "scrim";
    var sheet = document.createElement("div"); sheet.className = "sheet"; sheet.setAttribute("role", "dialog");
    var img = d.poster_path ? '<img src="' + poster(d.poster_path) + '" alt="' + esc(d.title) + '" />' : '<img alt="" />';
    var dateVal = rec.date || new Date().toISOString().slice(0, 10);
    sheet.innerHTML =
      '<div class="grab"></div>' +
      '<div class="detail-head">' + img +
        "<div><h2>" + esc(d.title) + "</h2>" +
        '<div class="meta">' + esc((d.release_date || "").slice(0, 4)) + " · " + esc(fmtRuntime(d.runtime)) + " · ★ " + esc(d.vote_average ? Number(d.vote_average).toFixed(1) : "—") + "</div>" +
        '<div class="meta">' + esc(t("directedByLbl")) + ": " + esc(director || "—") + "</div>" +
        '<div class="meta">' + esc(t("castLbl")) + ": " + esc(cast.map(function (c) { return c.name; }).join(", ") || "—") + "</div>" +
        "</div></div>" +
      '<p style="color:var(--muted)">' + esc(d.overview || t("noOverview")) + "</p>" +
      '<div class="actions"><button id="bWatched" class="' + (rec.watched ? "on-visto" : "") + '">' + esc(t("watched")) + '</button>' +
      '<button id="bWl" class="' + (rec.watchlist && !rec.watched ? "on-wl" : "") + '">' + esc(t("watchlistBtn")) + "</button></div>" +
      '<div class="mine"><h3>' + esc(t("myThoughts")) + '</h3><div class="stars" id="stars"></div>' +
      '<textarea id="note" placeholder="' + esc(t("howWasIt")) + '">' + esc(rec.note || "") + "</textarea>" +
      '<div class="row"><label>' + esc(t("watchedOn")) + ' <input type="date" id="dDate" value="' + esc(dateVal) + '" /></label>' +
      '<label><input type="checkbox" id="dSpoiler" ' + (rec.spoiler ? "checked" : "") + " /> " + esc(t("spoiler")) + "</label>" +
      '<label><input type="checkbox" id="dRewatch" ' + (rec.rewatch ? "checked" : "") + " /> " + esc(t("rewatch")) + "</label></div>" +
      '<div class="saved" id="saved"></div></div>';
    root.appendChild(scrim);
    root.appendChild(sheet);
    function close() { root.innerHTML = ""; }
    scrim.onclick = close;

    // stars
    var starsBox = sheet.querySelector("#stars");
    for (var i = 1; i <= 5; i++) {
      (function (v) {
        var b = document.createElement("button");
        b.textContent = "★"; b.setAttribute("aria-label", t("rating") + " " + v);
        if ((rec.rating || 0) >= v) b.className = "lit";
        b.onclick = function () {
          var cur = loadData(); var r = cur[d.id] || baseRec(d, director, cast);
          r.rating = (r.rating === v) ? 0 : v; r.watched = true;
          cur[d.id] = r; saveData(cur); data = cur;
          showSheet(d); renderAll();
          toast(t("markedWatched"), null);
        };
        starsBox.appendChild(b);
      })(i);
    }

    function persist(patch) {
      var cur = loadData(); var r = cur[d.id] || baseRec(d, director, cast);
      Object.keys(patch).forEach(function (k) { r[k] = patch[k]; });
      cur[d.id] = r; saveData(cur); data = cur;
      var s = sheet.querySelector("#saved"); if (s) s.textContent = t("saved");
      renderAll();
    }

    sheet.querySelector("#bWatched").onclick = function () {
      var cur = loadData(); var prev = cur[d.id] ? JSON.parse(JSON.stringify(cur[d.id])) : null;
      var r = cur[d.id] || baseRec(d, director, cast);
      if (r.watched) { delete cur[d.id]; if (r.watchlist) cur[d.id] = baseRec(d, director, cast); }
      else { r.watched = true; r.date = r.date || new Date().toISOString().slice(0, 10); cur[d.id] = r; }
      saveData(cur); data = cur; showSheet(d); renderAll();
      toast(r.watched ? t("markedWatched") : t("removed"), prev ? function () {
        var c2 = loadData(); if (prev) c2[d.id] = prev; else delete c2[d.id];
        saveData(c2); data = c2; showSheet(d); renderAll();
      } : null);
    };
    sheet.querySelector("#bWl").onclick = function () {
      var cur = loadData(); var r = cur[d.id] || baseRec(d, director, cast);
      r.watchlist = !r.watchlist; cur[d.id] = r; saveData(cur); data = cur;
      showSheet(d); renderAll();
      toast(r.watchlist ? t("markedWl") : t("removed"), null);
    };
    var noteT = null;
    sheet.querySelector("#note").addEventListener("input", function (e) {
      clearTimeout(noteT);
      noteT = setTimeout(function () { persist({ note: e.target.value, watched: true }); }, 500);
    });
    sheet.querySelector("#dDate").addEventListener("change", function (e) { persist({ date: e.target.value, watched: true }); });
    sheet.querySelector("#dSpoiler").addEventListener("change", function (e) { persist({ spoiler: e.target.checked, watched: true }); });
    sheet.querySelector("#dRewatch").addEventListener("change", function (e) { persist({ rewatch: e.target.checked, watched: true }); });
  }

  function baseRec(d, director, cast) {
    return {
      id: d.id, title: d.title || "",
      year: (d.release_date || "").slice(0, 4) || "",
      director: director || "",
      actors: (cast || []).map(function (c) { return c.name; }).slice(0, 6),
      runtime: d.runtime || null,
      poster: d.poster_path || "",
      watched: false, watchlist: true,
      rating: 0, note: "", date: new Date().toISOString().slice(0, 10),
      spoiler: false, rewatch: false
    };
  }

  /* ---------- watched / watchlist tabs ---------- */
  function allRecords() { return Object.keys(data).map(function (k) { return data[k]; }); }

  function renderMine() {
    var recs = allRecords();
    var watched = recs.filter(function (r) { return r.watched; });
    var wl = recs.filter(function (r) { return !r.watched && r.watchlist; });

    // year options
    var years = {};
    watched.forEach(function (r) { if (r.year) years[r.year] = 1; });
    var sel = els.fYear, cur = sel.value;
    sel.innerHTML = '<option value="">' + esc(t("yearAll")) + "</option>" +
      Object.keys(years).sort().reverse().map(function (y) { return '<option value="' + y + '">' + y + "</option>"; }).join("");
    sel.value = cur;

    var q = (els.fWatched.value || "").toLowerCase();
    var fr = els.fRating.value;
    var list = watched.filter(function (r) {
      var hay = ((r.title || "") + " " + (r.director || "") + " " + (r.actors || []).join(" ") + " " + (r.note || "")).toLowerCase();
      if (q && hay.indexOf(q) < 0) return false;
      if (fr === "5" && !(r.rating >= 5)) return false;
      if (fr === "4" && !(r.rating >= 4)) return false;
      if (fr === "3" && !(r.rating >= 3)) return false;
      if (fr === "notes" && !(r.note && r.note.trim())) return false;
      if (sel.value && String(r.year) !== String(sel.value)) return false;
      return true;
    });
    renderGrid(els.gridWatched, list.map(function (r) {
      return { id: r.id, title: r.title, release_date: (r.year || "") + "-01-01", poster_path: r.poster, vote_average: 0, popularity: 0 };
    }));
    els.watchedCount.textContent = watched.length ? watched.length + " " + t("yearFilms") : "";
    if (!list.length) setEmpty(els.emptyWatched, t("emptyWatched"), watched.length ? t("tryOther") : t("emptyWatchedSub"), watched.length ? null : t("discover"), watched.length ? null : function () { switchTab("search"); });
    else els.emptyWatched.hidden = true;

    renderGrid(els.gridWl, wl.map(function (r) {
      return { id: r.id, title: r.title, release_date: (r.year || "") + "-01-01", poster_path: r.poster, vote_average: 0, popularity: 0 };
    }));
    els.wlCount.textContent = wl.length ? wl.length + " " + t("yearFilms") : "";
    if (!wl.length) setEmpty(els.emptyWl, t("emptyWl"), t("emptyWlSub"), t("discover"), function () { switchTab("search"); });
    else els.emptyWl.hidden = true;

    els.nWatched.textContent = watched.length ? "(" + watched.length + ")" : "";
    els.nWl.textContent = wl.length ? "(" + wl.length + ")" : "";
  }

  function renderAll() { renderResults(); renderMine(); }

  /* ---------- tabs ---------- */
  function switchTab(name) {
    ["search", "watched", "watchlist"].forEach(function (n) {
      var map = { search: "view-search", watched: "view-watched", watchlist: "view-watchlist" };
      document.getElementById(map[n]).hidden = (n !== name);
    });
    document.querySelectorAll(".tabs button").forEach(function (b) {
      b.setAttribute("aria-selected", b.getAttribute("data-tab") === name ? "true" : "false");
    });
    if (name !== "search") renderMine();
    window.scrollTo(0, 0);
  }

  /* ---------- settings ---------- */
  function openSettings() {
    els.keyInput.value = getKey();
    if (typeof els.settingsDlg.showModal === "function") els.settingsDlg.showModal();
  }

  /* ---------- export / import ---------- */
  function doExport() {
    var blob = new Blob([JSON.stringify(allRecords(), null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "luce-export.json";
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    toast(t("exportDone"), null);
  }
  function doImport(file) {
    var rd = new FileReader();
    rd.onload = function () {
      try {
        var arr = JSON.parse(rd.result);
        if (!Array.isArray(arr)) throw new Error("bad");
        var cur = loadData();
        arr.forEach(function (r) { if (r && r.id) cur[r.id] = r; });
        saveData(cur); data = cur; renderAll();
        toast(t("importDone"), null);
      } catch (e) { toast(t("importFail"), null); }
    };
    rd.readAsText(file);
  }

  /* ---------- events ---------- */
  function syncChips() {
    document.querySelectorAll(".chip[data-mode]").forEach(function (c) {
      c.setAttribute("aria-pressed", c.getAttribute("data-mode") === mode ? "true" : "false");
    });
  }

  document.querySelectorAll(".chip[data-mode]").forEach(function (c) {
    c.addEventListener("click", function () {
      mode = c.getAttribute("data-mode");
      syncChips();
      if (els.q.value.trim()) runSearch();
    });
  });
  els.go.addEventListener("click", runSearch);
  els.q.addEventListener("input", function () {
    clearTimeout(debounce);
    debounce = setTimeout(runSearch, 450);
  });
  els.q.addEventListener("keydown", function (e) { if (e.key === "Enter") runSearch(); });
  els.more.addEventListener("click", loadMore);
  els.sort.addEventListener("change", function () { sortBy = els.sort.value; renderResults(); });
  document.querySelectorAll(".tabs button").forEach(function (b) {
    b.addEventListener("click", function () { switchTab(b.getAttribute("data-tab")); });
  });
  document.addEventListener("click", function (e) {
    var card = e.target.closest ? e.target.closest(".card") : null;
    if (card && card.getAttribute("data-id")) openDetail(card.getAttribute("data-id"));
  });
  els.settingsBtn.addEventListener("click", openSettings);
  els.saveKey.addEventListener("click", function () {
    var v = (els.keyInput.value || "").trim();
    if (!v) { toast(t("keyMissing"), null); return; }
    writeLS(LS_KEY, v);
    toast(t("keySaved"), null);
    runSearch();
  });
  els.exportBtn.addEventListener("click", doExport);
  els.importBtn.addEventListener("click", function () { els.importFile.click(); });
  els.importFile.addEventListener("change", function () {
    if (els.importFile.files[0]) doImport(els.importFile.files[0]);
    els.importFile.value = "";
  });
  ["fWatched", "fYear", "fRating"].forEach(function (id) {
    $(id).addEventListener("input", renderMine);
    $(id).addEventListener("change", renderMine);
  });
  els.langBtn.addEventListener("click", function () {
    lang = (lang === "it") ? "en" : "it";
    applyLang();
  });

  /* ---------- init ---------- */
  applyLang();
  syncChips();
  runTrending();
})();
