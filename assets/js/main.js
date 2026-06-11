(function(){
  const SITE = 'https://unboxwithprapul.in';
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const escapeHTML = (value='') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const niceDate = (value) => {
    if(!value) return '';
    const d = new Date(value + 'T00:00:00');
    return d.toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'});
  };
  const sortPosts = (posts) => [...posts].sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  const postUrl = (post) => post.url || `posts/${post.slug}.html`;
  const imageUrl = (post) => post.image || 'assets/img/og-default.svg';

  function card(post){
    return `
      <article class="article-card">
        <a class="thumb" href="${escapeHTML(postUrl(post))}" aria-label="Read ${escapeHTML(post.title)}">
          <img src="${escapeHTML(imageUrl(post))}" alt="${escapeHTML(post.title)}" loading="lazy">
        </a>
        <div class="content">
          <div class="meta"><span class="badge">${escapeHTML(post.category || 'Tech')}</span><span>${niceDate(post.date)}</span></div>
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
    const picked = filterPosts(sortPosts(posts), type).slice(0, limit);
    el.innerHTML = picked.length ? picked.map(card).join('') : '<div class="empty-state">No articles here yet. Add your first article from studio.html.</div>';
  }

  async function loadPosts(){
    const res = await fetch('data/posts.json?v=' + Date.now(), {cache:'no-store'});
    if(!res.ok) throw new Error('Could not load data/posts.json');
    return await res.json();
  }

  document.addEventListener('DOMContentLoaded', async () => {
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

    const lists = $$('[data-post-list]');
    if(!lists.length) return;
    try{
      const posts = await loadPosts();
      lists.forEach(el => renderList(el, posts));

      const newsList = $('[data-live-news-list]');
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
      console.error(err);
    }
  });
})();
