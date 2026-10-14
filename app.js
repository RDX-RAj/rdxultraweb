(() => {
  const $ = s => document.querySelector(s);
  const audio = $('#audioPlayer'); let content = { site: {}, tracks: [], videos: [] }; let active = 0;
  const fmt = n => { if (!Number.isFinite(n)) return '0:00'; return `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, '0')}`; };
  function toast(message) { const t = $('#toast'); t.textContent = message; t.classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(() => t.classList.remove('show'), 2500); }
  function safeLink(el, url, fallback) { if (el && url && /^https?:\/\//i.test(url)) el.href = url; else if (el) el.href = fallback; }
  function renderTracks() {
    const tracks = content.tracks || []; $('#trackCount').textContent = `${String(tracks.length).padStart(2,'0')} TRACK${tracks.length === 1 ? '' : 'S'}`;
    const list = $('#playlist');
    if (!tracks.length) { list.innerHTML = '<div class="empty-state">Your playlist will appear here.<br><span>Add tracks in <a href="/admin">Admin Panel ↗</a></span></div>'; $('#trackTitle').textContent = 'Your next favourite track'; $('#trackArtist').textContent = 'Add your audio in Admin Panel'; return; }
    list.replaceChildren(); tracks.forEach((track, i) => {
      const row = document.createElement('button'); row.type = 'button'; row.className = `playlist-item${i === active ? ' active' : ''}`; row.style.width = '100%'; row.style.textAlign = 'left'; row.setAttribute('aria-label', `Play ${track.title}`);
      const num = document.createElement('span'); num.className = 'num'; num.textContent = String(i + 1).padStart(2, '0');
      const title = document.createElement('span'); title.className = 'p-title'; title.textContent = track.title;
      const artist = document.createElement('span'); artist.className = 'p-artist'; artist.textContent = track.artist || 'Editor Raj';
      row.append(num, title, artist); row.addEventListener('click', () => loadTrack(i, true)); list.append(row);
    });
  }
  function loadTrack(index, autoplay = false) {
    const tracks = content.tracks || []; if (!tracks.length) { toast('Add tracks in Admin Panel first.'); return; }
    active = (index + tracks.length) % tracks.length; const t = tracks[active]; audio.src = t.src; $('#trackTitle').textContent = t.title; $('#trackArtist').textContent = t.artist || 'Editor Raj'; renderTracks();
    if (autoplay) audio.play().then(() => $('#playTrack').textContent = 'Ⅱ').catch(() => toast('Audio could not play. Check the audio URL.'));
  }
  function renderVideos() {
    const grid = $('#videoGrid'); grid.replaceChildren(); const videos = content.videos || [];
    if (!videos.length) { const empty = document.createElement('div'); empty.className = 'empty-video reveal visible'; empty.innerHTML = '<div class="video-placeholder">▶</div><h3>YOUR NEXT DROP GOES HERE</h3><p>Add YouTube videos from the Admin Panel.</p>'; grid.append(empty); return; }
    videos.forEach((video, i) => {
      const id = (video.youtubeId || '').replace(/[^\w-]/g, ''); const href = id ? `https://www.youtube.com/watch?v=${id}` : video.url;
      const card = document.createElement('article'); card.className = 'video-card reveal visible';
      const a = document.createElement('a'); a.className = 'video-thumb'; a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.setAttribute('aria-label', `Watch ${video.title} on YouTube`);
      const img = document.createElement('img'); img.loading = 'lazy'; img.alt = `${video.title} thumbnail`; img.src = video.thumbnail || (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : 'assets/og-cover.svg'); img.onerror = () => { img.onerror = null; img.src = 'assets/og-cover.svg'; }; a.append(img);
      const copy = document.createElement('div'); copy.className = 'video-copy'; const small = document.createElement('small'); small.textContent = video.label || `FEATURED VIDEO / ${String(i + 1).padStart(2,'0')}`; const h = document.createElement('h3'); h.textContent = video.title; copy.append(small, h); card.append(a, copy); grid.append(card);
    });
  }
  function applySite(site = {}) {
    if (site.name) document.title = `${site.name}® — RDX Ultra Web`;
    safeLink($('#navYoutube'), site.youtube, 'https://www.youtube.com/'); safeLink($('#allVideosLink'), site.youtube, 'https://www.youtube.com/');
    if (site.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(site.email)) $('#emailLink').href = `mailto:${site.email}`;
    const social = $('#socialLinks'); const links = [['Instagram',site.instagram],['Telegram',site.telegram],['Facebook',site.facebook]];
    social.replaceChildren(); links.forEach(([name,url]) => { if (/^https?:\/\//i.test(url || '')) { const a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = `${name} ↗`; social.append(a); } });
    if (site.description) $('.about-text').textContent = site.description;
    if (site.tagline) $('.hero-desc').innerHTML = `${site.tagline.replace(/[<>]/g,'')}<br>Welcome to my creative universe.`;
  }
  async function init() {
    $('#year').textContent = new Date().getFullYear();
    try { const r = await fetch('api/content', { headers: { Accept: 'application/json' } }); if (!r.ok) throw new Error('API unavailable'); content = await r.json(); applySite(content.site); renderTracks(); renderVideos(); }
    catch { renderTracks(); renderVideos(); toast('Live content unavailable. Start the website server.'); }
    $('#playTrack').addEventListener('click', () => { if (!content.tracks?.length) return toast('Add tracks in Admin Panel first.'); if (audio.paused) audio.play().then(() => $('#playTrack').textContent = 'Ⅱ').catch(() => toast('Audio URL unavailable.')); else audio.pause(); });
    $('#prevTrack').addEventListener('click', () => loadTrack(active - 1, true)); $('#nextTrack').addEventListener('click', () => loadTrack(active + 1, true));
    audio.addEventListener('play', () => $('#playTrack').textContent = 'Ⅱ'); audio.addEventListener('pause', () => $('#playTrack').textContent = '▶');
    audio.addEventListener('loadedmetadata', () => { $('#duration').textContent = fmt(audio.duration); }); audio.addEventListener('timeupdate', () => { $('#currentTime').textContent = fmt(audio.currentTime); $('#seekBar').value = audio.duration ? audio.currentTime / audio.duration * 100 : 0; });
    $('#seekBar').addEventListener('input', e => { if (audio.duration) audio.currentTime = Number(e.target.value) / 100 * audio.duration; }); $('#volumeBar').addEventListener('input', e => audio.volume = Number(e.target.value)); audio.volume = .8;
    $('#themeToggle').addEventListener('click', () => { document.body.classList.toggle('light'); localStorage.setItem('rdx-theme', document.body.classList.contains('light') ? 'light' : 'dark'); });
    if (localStorage.getItem('rdx-theme') === 'light') document.body.classList.add('light');
    $('#menuToggle').addEventListener('click', () => { const nav = $('.desktop-nav'); const open = nav.classList.toggle('open'); $('#menuToggle').setAttribute('aria-expanded', String(open)); $('#menuToggle').textContent = open ? '×' : '☰'; });
    document.querySelectorAll('.desktop-nav a').forEach(a => a.addEventListener('click', () => { $('.desktop-nav').classList.remove('open'); $('#menuToggle').setAttribute('aria-expanded','false'); $('#menuToggle').textContent = '☰'; }));
    if (matchMedia('(pointer:fine)').matches) document.addEventListener('pointermove', e => { const g = $('.cursor-glow'); g.style.left = `${e.clientX}px`; g.style.top = `${e.clientY}px`; }, { passive: true });
    const observer = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } }), { threshold: .12 }); document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
  init();
})();
