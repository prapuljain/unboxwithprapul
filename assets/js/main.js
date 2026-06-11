(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const escapeHTML = (value='') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const rootPath = (value='') => {
    value = String(value || '').trim();
    if(!value) return '';
    if(/^(https?:|data:|mailto:|tel:)/i.test(value)) return value;
    if(value.startsWith('/')) return value;
    if(value.startsWith('../')) return '/' + value.replace(/^(\.\.\/)+/,'');
    return '/' + value.replace(/^\.\//,'');
  };
  const niceDate = (value) => {
    if(!value) return '';
    const d = new Date(value + 'T00:00:00');
    return d.toLocaleDateString('en', {day:'numeric', month:'short', year:'numeric'});
  };
  const cleanSlug = (post) => String(post?.slug || post?.title || '').trim().toLowerCase();
  function dedupePosts(posts){
    const map = new Map();
    (Array.isArray(posts) ? posts : []).forEach((p, index) => {
      if(!p || typeof p !== 'object') return;
      const key = cleanSlug(p) || ('post-' + index);
      const normalized = Object.assign({}, p);
      if(normalized.slug) normalized.url = `/posts/${normalized.slug}/`;
      if(!map.has(key)){ map.set(key, normalized); return; }
      const old = map.get(key);
      const oldScore = String(old.updated || old.date || '') + String(old.title || '');
      const newScore = String(normalized.updated || normalized.date || '') + String(normalized.title || '');
      map.set(key, newScore >= oldScore ? Object.assign({}, old, normalized) : old);
    });
    return Array.from(map.values());
  }
  const sortPosts = (posts) => dedupePosts(posts).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  const postUrl = (post) => post?.slug ? `/posts/${post.slug}/` : rootPath(post?.url || '#');
  const imageUrl = (post) => rootPath(post?.image || 'assets/img/og-default.svg');
  const readingTime = (post) => {
    const words = String(post.content || post.excerpt || '').trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 220)) + ' min read';
  };

  function card(post){
    return `
      <article class="article-card">
        <a class="thumb" href="${escapeHTML(postUrl(post))}" aria-label="Read ${escapeHTML(post.title)}">
          <img src="${escapeHTML(imageUrl(post))}" alt="${escapeHTML(post.title)}" loading="lazy" onerror="this.onerror=null;this.src='/assets/img/og-default.svg';">
        </a>
        <div class="content">
          <div class="meta"><span class="badge">${escapeHTML(post.category || 'Tech')}</span><span>${niceDate(post.date)}</span><span>${readingTime(post)}</span></div>
          <h3><a href="${escapeHTML(postUrl(post))}">${escapeHTML(post.title)}</a></h3>
          <p>${escapeHTML(post.excerpt || '')}</p>
          <a class="read-more" href="${escapeHTML(postUrl(post))}">Read article →</a>
        </div>
      </article>`;
  }

  function filterPosts(posts, type){
    const t = (type || 'latest').toLowerCase();
    if(t === 'latest') return posts;
    if(t === 'featured') return posts.filter(p => p.featured);
    if(t === 'news') return posts.filter(p => (p.category || '').toLowerCase().includes('news'));
    if(t === 'guides') return posts.filter(p => (p.category || '').toLowerCase().includes('guide'));
    if(t === 'reviews') return posts.filter(p => (p.category || '').toLowerCase().includes('review'));
    return posts.filter(p => (p.category || '').toLowerCase().includes(t));
  }

  function renderList(el, posts){
    const type = el.dataset.postList || 'latest';
    const limit = Number(el.dataset.limit || 99);
    const picked = filterPosts(sortPosts(posts), type).slice(0, limit || 99);
    el.innerHTML = picked.length ? picked.map(card).join('') : '<div class="empty-state">No articles yet.</div>';
  }

  async function loadPosts(){
    const res = await fetch('/data/posts.json?v=' + Date.now(), {cache:'no-store'});
    if(!res.ok) throw new Error('Could not load data/posts.json');
    return dedupePosts(await res.json());
  }

  function initNavigation(){
    const navToggle = $('.nav-toggle');
    const nav = $('.site-nav');
    if(navToggle && nav){
      navToggle.addEventListener('click', () => {
        const open = nav.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
    const year = $('[data-year]');
    if(year) year.textContent = new Date().getFullYear();
  }

  function initOutboundTracking(){
    document.addEventListener('click', (event) => {
      const link = event.target.closest && event.target.closest('a[href]');
      if(!link) return;
      let url;
      try { url = new URL(link.href, location.href); } catch { return; }
      const outbound = url.hostname && url.hostname !== location.hostname;
      if(outbound && typeof window.gtag === 'function'){
        window.gtag('event', 'click', {
          event_category: 'outbound',
          event_label: link.href,
          link_url: link.href,
          link_domain: url.hostname,
          transport_type: 'beacon'
        });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    initNavigation();
    initOutboundTracking();

    const lists = $$('[data-post-list]');
    const newsList = $('[data-live-news-list]');
    if(!lists.length && !newsList) return;
    try{
      const posts = await loadPosts();
      lists.forEach(el => renderList(el, posts));

      const search = $('[data-news-search]');
      const buttons = $$('.filter-btn[data-filter]');
      let currentFilter = 'all';
      function applyNewsFilters(){
        if(!newsList) return;
        const query = (search?.value || '').trim().toLowerCase();
        let filtered = sortPosts(posts);
        if(currentFilter !== 'all') filtered = filtered.filter(p => (p.category || '').toLowerCase().includes(currentFilter));
        if(query){
          filtered = filtered.filter(p => [p.title,p.excerpt,p.category,(p.tags||[]).join(' ')].join(' ').toLowerCase().includes(query));
        }
        newsList.innerHTML = filtered.length ? filtered.map(card).join('') : '<div class="empty-state">No matching articles found.</div>';
      }
      if(newsList){
        const params = new URLSearchParams(location.search);
        if(params.get('q') && search) search.value = params.get('q');
        applyNewsFilters();
        search?.addEventListener('input', applyNewsFilters);
        buttons.forEach(btn => btn.addEventListener('click', () => {
          buttons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentFilter = btn.dataset.filter || 'all';
          applyNewsFilters();
        }));
      }
    }catch(err){
      lists.forEach(el => el.innerHTML = '<div class="empty-state">Posts could not be loaded. Check data/posts.json.</div>');
      if(newsList) newsList.innerHTML = '<div class="empty-state">Posts could not be loaded. Check data/posts.json.</div>';
      console.error(err);
    }
  });
})();
