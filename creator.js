(() => {
  const creator = { open:false, tab:'overview', profile:null, posts:[], playlists:[] };
  const db = window.supabase.createClient(window.LARPTOK_SUPABASE_URL || 'https://rphsmqppmqvqzfpcablw.supabase.co', window.LARPTOK_SUPABASE_KEY || 'sb_publishable_vB7G9y3xTKk0swxKAbaIHQ_Gt1tshVw');
  const $ = id => document.getElementById(id);
  const esc = v => String(v ?? '').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const fmt = n => new Intl.NumberFormat().format(n || 0);
  const pct = (n,d) => d ? `${Math.round((n/d)*100)}%` : '0%';
  const ago = d => { const s=Math.max(0,(Date.now()-new Date(d).getTime())/1000); if(s<60)return 'just now'; if(s<3600)return `${Math.floor(s/60)}m ago`; if(s<86400)return `${Math.floor(s/3600)}h ago`; return `${Math.floor(s/86400)}d ago`; };
  function currentUser(){ return window.__larptokSession?.user || null; }
  function show(){ const p=$('creatorPanel'); if(!p)return; p.classList.remove('hidden'); creator.open=true; loadDashboard(); }
  function hide(){ $('creatorPanel')?.classList.add('hidden'); creator.open=false; }
  async function loadDashboard(){
    const u=currentUser(); if(!u){ alert('Log in to open Creator Center.'); return; }
    $('creatorResults').innerHTML='<div class="loading">Loading your creator data…</div>';
    try {
      const [profileRes,postsRes,followersRes,playlistsRes,draftsRes] = await Promise.all([
        db.from('profiles').select('*').eq('id',u.id).single(),
        db.from('posts').select('id,caption,media_url,media_type,created_at,is_public,allow_comments').eq('user_id',u.id).order('created_at',{ascending:false}),
        db.from('follows').select('follower_id,created_at').eq('following_id',u.id),
        db.from('playlists').select('id,name,description,is_public,created_at,playlist_posts(post_id,position)').eq('user_id',u.id).order('created_at',{ascending:false}),
        db.from('drafts').select('*').eq('user_id',u.id).order('updated_at',{ascending:false})
      ]);
      if(profileRes.error) throw profileRes.error;
      creator.profile=profileRes.data; creator.posts=postsRes.data||[]; creator.followers=followersRes.data||[]; creator.playlists=playlistsRes.data||[]; creator.drafts=draftsRes.data||[];
      creator.analytics=await getAnalytics(); renderCreator();
    } catch(e){ $('creatorResults').innerHTML=`<div class="emptyState">Creator Center failed: ${esc(e.message)}</div>`; }
  }
  async function getAnalytics(){
    const ids=creator.posts.map(p=>p.id); if(!ids.length) return {views:0,likes:0,comments:0,reposts:0,favorites:0,shares:0,engagement:0,rows:[]};
    const [views,likes,comments,reposts,favorites,shares] = await Promise.all([
      db.from('post_views').select('post_id,created_at').in('post_id',ids),
      db.from('likes').select('post_id,created_at').in('post_id',ids),
      db.from('comments').select('id,post_id,created_at').in('post_id',ids),
      db.from('reposts').select('post_id,created_at').in('post_id',ids),
      db.from('favorites').select('post_id,created_at').in('post_id',ids),
      db.from('post_shares').select('post_id,created_at').in('post_id',ids)
    ]);
    const groups={}; creator.posts.forEach(p=>groups[p.id]={post:p,views:0,likes:0,comments:0,reposts:0,favorites:0,shares:0});
    (views.data||[]).forEach(x=>groups[x.post_id]&&(groups[x.post_id].views++)); (likes.data||[]).forEach(x=>groups[x.post_id]&&(groups[x.post_id].likes++)); (comments.data||[]).forEach(x=>groups[x.post_id]&&(groups[x.post_id].comments++)); (reposts.data||[]).forEach(x=>groups[x.post_id]&&(groups[x.post_id].reposts++)); (favorites.data||[]).forEach(x=>groups[x.post_id]&&(groups[x.post_id].favorites++)); (shares.data||[]).forEach(x=>groups[x.post_id]&&(groups[x.post_id].shares++));
    const rows=Object.values(groups).sort((a,b)=>(b.likes+b.comments+b.reposts+b.favorites+b.shares)-(a.likes+a.comments+a.reposts+a.favorites+a.shares));
    const total=x=>rows.reduce((a,r)=>a+r[x],0), likesN=total('likes'), commentsN=total('comments'), repostsN=total('reposts'), favoritesN=total('favorites'), sharesN=total('shares'), viewsN=total('views');
    return {views:viewsN,likes:likesN,comments:commentsN,reposts:repostsN,favorites:favoritesN,shares:sharesN,engagement:likesN+commentsN+repostsN+favoritesN+sharesN,rows};
  }
  function renderCreator(){
    const a=creator.analytics||{}; const tabs=['overview','content','playlists','drafts','profile'];
    $('creatorResults').innerHTML=`<div class="creatorTabs">${tabs.map(t=>`<button class="creatorTab ${creator.tab===t?'active':''}" data-ctab="${t}">${({overview:'📊 Overview',content:'🎬 Content',playlists:'📋 Playlists',drafts:'📝 Drafts',profile:'👤 Profile'})[t]}</button>`).join('')}</div><div id="creatorBody"></div>`;
    document.querySelectorAll('[data-ctab]').forEach(b=>b.onclick=()=>{creator.tab=b.dataset.ctab;renderCreator();});
    const body=$('creatorBody'); if(creator.tab==='overview') body.innerHTML=overviewHTML(a); else if(creator.tab==='content') body.innerHTML=contentHTML(a); else if(creator.tab==='playlists') body.innerHTML=playlistsHTML(); else if(creator.tab==='drafts') body.innerHTML=draftsHTML(); else body.innerHTML=profileHTML(); bindCreator();
  }
  function overviewHTML(a){ const top=(a.rows||[]).slice(0,5); return `<div class="creatorGrid">${[['👀','Views',a.views],['❤️','Likes',a.likes],['💬','Comments',a.comments],['🔁','Reposts',a.reposts],['⭐','Favorites',a.favorites],['📤','Shares',a.shares],['👥','Followers',creator.followers?.length||0],['📈','Engagement',a.engagement]].map(x=>`<div class="metric"><span>${x[0]}</span><b>${fmt(x[2])}</b><small>${x[1]}</small></div>`).join('')}</div><section class="creatorCard"><h3>Top-performing posts</h3>${top.length?top.map(r=>postRow(r)).join(''):'<div class="muted">Create a post to start seeing analytics.</div>'}</section>`; }
  function postRow(r){return `<div class="analyticsRow"><div class="analyticsThumb">${r.post.media_url?(r.post.media_type==='video'?'<span>▶️</span>':`<img src="${esc(r.post.media_url)}" alt="">`):'🎭'}</div><div class="analyticsInfo"><b>${esc((r.post.caption||'Untitled post').slice(0,70))}</b><small>${ago(r.post.created_at)}</small></div><div class="analyticsStats">👀 ${fmt(r.views)} · ❤️ ${fmt(r.likes)} · 💬 ${fmt(r.comments)} · 🔁 ${fmt(r.reposts)} · ⭐ ${fmt(r.favorites)} · 📤 ${fmt(r.shares)}<br><small>Engagement ${pct(r.likes+r.comments+r.reposts+r.favorites+r.shares,Math.max(1,r.views))}</small></div></div>`;}
  function contentHTML(a){return `<div class="creatorCard"><div class="sectionHeader"><div><h3>Your content</h3><p class="muted">Edit, delete, change privacy, and inspect per-post performance.</p></div><button class="primary" id="refreshCreator">Refresh</button></div>${(a.rows||[]).map(r=>`<div class="contentRow">${postRow(r)}<div class="contentButtons"><button class="ghost" data-edit="${r.post.id}">Edit</button><button class="ghost" data-delete="${r.post.id}">Delete</button><button class="ghost" data-privacy="${r.post.id}">${r.post.is_public?'Public':'Private'}</button><button class="ghost" data-comments="${r.post.id}">${r.post.allow_comments?'Comments on':'Comments off'}</button></div></div>`).join('')||'<div class="emptyState">No posts yet.</div>'}</div>`;}
  function playlistsHTML(){return `<div class="creatorCard"><div class="sectionHeader"><div><h3>Playlists</h3><p class="muted">Organize your LARP posts into public or private collections.</p></div><button class="primary" id="newPlaylist">＋ New playlist</button></div>${creator.playlists.map(p=>`<div class="playlistRow"><div><b>${esc(p.name)}</b><small>${p.is_public?'Public':'Private'} · ${p.playlist_posts?.length||0} posts</small></div><div><button class="ghost" data-playedit="${p.id}">Rename</button><button class="ghost" data-playdelete="${p.id}">Delete</button></div></div>`).join('')||'<div class="emptyState">No playlists yet.</div>'}</div>`;}
  function draftsHTML(){return `<div class="creatorCard"><div class="sectionHeader"><div><h3>Drafts</h3><p class="muted">Keep unfinished ideas here. Drafts are private to your account.</p></div><button class="primary" id="newDraft">＋ New draft</button></div>${creator.drafts.map(d=>`<div class="playlistRow"><div><b>${esc((d.caption||'Empty draft').slice(0,70))}</b><small>Updated ${ago(d.updated_at)}</small></div><div><button class="ghost" data-draftload="${d.id}">Load</button><button class="ghost" data-draftdelete="${d.id}">Delete</button></div></div>`).join('')||'<div class="emptyState">No drafts yet.</div>'}</div>`;}
  function profileHTML(){const p=creator.profile||{};return `<div class="creatorCard"><h3>Profile customization</h3><form id="profileForm" class="creatorForm"><label>Display name<input id="cpDisplay" maxlength="40" value="${esc(p.display_name||'')}"></label><label>Username<input id="cpUsername" maxlength="24" value="${esc(p.username||'')}"></label><label>Bio<textarea id="cpBio" maxlength="160">${esc(p.bio||'')}</textarea></label><label>Website<input id="cpWebsite" type="url" maxlength="200" value="${esc(p.website_url||'')}"></label><label class="check"><input id="cpPrivate" type="checkbox" ${p.is_private?'checked':''}> Private account</label><button class="primary">Save profile</button><p id="profileMsg" class="muted"></p></form></div>`;}
  function bindCreator(){
    $('refreshCreator')?.addEventListener('click',loadDashboard);
    $('newPlaylist')?.addEventListener('click',createPlaylist);
    $('newDraft')?.addEventListener('click',createDraft);
    $('profileForm')?.addEventListener('submit',saveProfile);
    document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>editPost(+b.dataset.edit)); document.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>deletePost(+b.dataset.delete)); document.querySelectorAll('[data-privacy]').forEach(b=>b.onclick=()=>togglePostSetting(+b.dataset.privacy,'is_public')); document.querySelectorAll('[data-comments]').forEach(b=>b.onclick=()=>togglePostSetting(+b.dataset.comments,'allow_comments'));
    document.querySelectorAll('[data-playedit]').forEach(b=>b.onclick=()=>renamePlaylist(+b.dataset.playedit)); document.querySelectorAll('[data-playdelete]').forEach(b=>b.onclick=()=>deletePlaylist(+b.dataset.playdelete)); document.querySelectorAll('[data-draftload]').forEach(b=>b.onclick=()=>loadDraft(+b.dataset.draftload)); document.querySelectorAll('[data-draftdelete]').forEach(b=>b.onclick=()=>deleteDraft(+b.dataset.draftdelete));
  }
  async function editPost(id){const p=creator.posts.find(x=>x.id===id);if(!p)return;const caption=prompt('Edit caption:',p.caption||'');if(caption===null)return;const {error}=await db.from('posts').update({caption}).eq('id',id).eq('user_id',currentUser().id);if(error)alert(error.message);else loadDashboard();}
  async function deletePost(id){if(!confirm('Delete this post permanently?'))return;const {error}=await db.from('posts').delete().eq('id',id).eq('user_id',currentUser().id);if(error)alert(error.message);else loadDashboard();}
  async function togglePostSetting(id,field){const p=creator.posts.find(x=>x.id===id);if(!p)return;const value=!p[field];const patch={};patch[field]=value;const {error}=await db.from('posts').update(patch).eq('id',id).eq('user_id',currentUser().id);if(error)alert(error.message);else loadDashboard();}
  async function createPlaylist(){const name=prompt('Playlist name:');if(!name?.trim())return;const {error}=await db.from('playlists').insert({user_id:currentUser().id,name:name.trim(),is_public:true});if(error)alert(error.message);else loadDashboard();}
  async function renamePlaylist(id){const p=creator.playlists.find(x=>x.id===id);if(!p)return;const name=prompt('New playlist name:',p.name);if(!name?.trim())return;const {error}=await db.from('playlists').update({name:name.trim(),updated_at:new Date().toISOString()}).eq('id',id).eq('user_id',currentUser().id);if(error)alert(error.message);else loadDashboard();}
  async function deletePlaylist(id){if(!confirm('Delete this playlist? Posts will not be deleted.'))return;const {error}=await db.from('playlists').delete().eq('id',id).eq('user_id',currentUser().id);if(error)alert(error.message);else loadDashboard();}
  async function createDraft(){const caption=prompt('Draft caption:','');const {error}=await db.from('drafts').insert({user_id:currentUser().id,caption:caption||''});if(error)alert(error.message);else loadDashboard();}
  async function loadDraft(id){const d=creator.drafts.find(x=>x.id===id);if(!d)return; const composer=$('caption'); if(composer){composer.value=d.caption||''; hide(); composer.focus(); window.scrollTo({top:composer.closest('.composer')?.offsetTop||0,behavior:'smooth'}); alert('Draft loaded into the composer.');}}
  async function deleteDraft(id){if(!confirm('Delete this draft?'))return;const {error}=await db.from('drafts').delete().eq('id',id).eq('user_id',currentUser().id);if(error)alert(error.message);else loadDashboard();}
  async function saveProfile(e){e.preventDefault();const u=currentUser();const payload={display_name:$('cpDisplay').value.trim(),username:$('cpUsername').value.trim().toLowerCase(),bio:$('cpBio').value.trim(),website_url:$('cpWebsite').value.trim()||null,is_private:$('cpPrivate').checked};if(!/^[a-z0-9_]{3,24}$/.test(payload.username)){ $('profileMsg').textContent='Username must be 3–24 characters using letters, numbers, or underscores.';return;}const {error}=await db.from('profiles').update(payload).eq('id',u.id);$('profileMsg').textContent=error?error.message:'Profile saved!';if(!error)loadDashboard();}
  function trackVisiblePosts(){const feed=$('feed');if(!feed||!window.IntersectionObserver)return;const seen=new Set();const io=new IntersectionObserver(entries=>{entries.forEach(async e=>{if(!e.isIntersecting||e.intersectionRatio<.6)return;const id=Number(e.target.id.replace('post-',''));if(!id||seen.has(id))return;seen.add(id);const u=currentUser();await db.from('post_views').insert({post_id:id,viewer_id:u?.id||null});});},{threshold:.6});feed.querySelectorAll('.post[id^="post-"]').forEach(el=>io.observe(el));}
  function watchFeed(){const feed=$('feed');if(!feed)return;new MutationObserver(()=>setTimeout(trackVisiblePosts,50)).observe(feed,{childList:true,subtree:true});setTimeout(trackVisiblePosts,200);}
  function install(){
    const btn=$('creatorCenterBtn'); if(btn)btn.onclick=show;
    $('closeCreator')?.addEventListener('click',hide);
    watchFeed();
    const originalSessionGetter=()=>window.__larptokSession;
    setInterval(()=>{if(originalSessionGetter() && $('creatorCenterBtn'))$('creatorCenterBtn').classList.remove('hidden');},1000);
  }
  window.LarpTokCreator={show,hide,loadDashboard,trackVisiblePosts};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();