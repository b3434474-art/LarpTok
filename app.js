const SUPABASE_URL = 'https://rphsmqppmqvqzfpcablw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_vB7G9y3xTKk0swxKAbaIHQ_Gt1tshVw';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let session = null;
let mode = 'login';
let feedMode = 'fyp';

const $ = id => document.getElementById(id);

async function init(){
  const {data} = await db.auth.getSession();
  session = data.session;
  renderAccount();
  renderComposer();
  await loadFeed();
  db.auth.onAuthStateChange((_event,newSession)=>{ session=newSession; renderAccount(); renderComposer(); loadFeed(); });
}

function renderAccount(){
  const area=$('accountArea');
  if(session){
    area.innerHTML='<button class="ghost" id="logout">Log out</button>';
    $('logout').onclick=()=>db.auth.signOut();
  } else {
    area.innerHTML='<button class="ghost" id="openAuth">Log in</button>';
    $('openAuth').onclick=()=>{$('authPanel').classList.remove('hidden'); window.scrollTo({top:0,behavior:'smooth'});};
  }
}
function renderComposer(){ $('composer').classList.toggle('hidden',!session); }

$('openAuth')?.addEventListener('click',()=>$('authPanel').classList.remove('hidden'));
$('toggleAuth').addEventListener('click',()=>{
  mode=mode==='login'?'signup':'login';
  $('authTitle').textContent=mode==='login'?'Welcome back to LarpTok':'Join LarpTok';
  $('displayName').classList.toggle('hidden',mode==='login');
  $('username').classList.toggle('hidden',mode==='login');
  $('toggleAuth').textContent=mode==='login'?'Create an account':'I already have an account';
});

$('authForm').addEventListener('submit',async e=>{
  e.preventDefault(); $('authMessage').textContent='';
  const email=$('email').value.trim(), password=$('password').value;
  if(mode==='login'){
    const {error}=await db.auth.signInWithPassword({email,password});
    $('authMessage').textContent=error?error.message:'Logged in!';
  }else{
    const username=$('username').value.trim().toLowerCase();
    const displayName=$('displayName').value.trim()||username;
    if(!username){$('authMessage').textContent='Choose a username.';return;}
    const {error}=await db.auth.signUp({email,password,options:{data:{username,display_name:displayName}}});
    $('authMessage').textContent=error?error.message:'Account created. Check your email if confirmation is enabled.';
  }
});

$('postButton').addEventListener('click',async()=>{
  if(!session)return;
  const caption=$('caption').value.trim(), media_type=$('mediaType').value, media_url=$('mediaUrl').value.trim()||null;
  const {error}=await db.from('posts').insert({user_id:session.user.id,caption,media_type,media_url});
  if(error){alert(error.message);return;}
  $('caption').value='';$('mediaUrl').value='';await loadFeed();
});

document.querySelectorAll('.tab').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));btn.classList.add('active');feedMode=btn.dataset.feed;loadFeed();
}));

async function loadFeed(){
  const feed=$('feed');feed.innerHTML='<div class="loading">Loading…</div>';
  let query=db.from('posts').select('id,user_id,caption,media_url,media_type,created_at,profiles(username,display_name,avatar_url),likes(user_id),comments(id,user_id,body,created_at,profiles(username))').order('created_at',{ascending:false}).limit(30);
  const {data,error}=await query;
  if(error){feed.innerHTML=`<div class="loading">Could not load posts: ${escapeHtml(error.message)}</div>`;return;}
  let posts=data||[];
  if(feedMode==='following' && session){
    const {data:follows}=await db.from('follows').select('following_id').eq('follower_id',session.user.id);
    const ids=new Set((follows||[]).map(x=>x.following_id)); posts=posts.filter(p=>ids.has(p.user_id));
  }
  if(!posts.length){feed.innerHTML='<div class="loading">No posts yet. Be the first LARPer to post! 🎭</div>';return;}
  feed.innerHTML=posts.map(renderPost).join('');
  feed.querySelectorAll('[data-like]').forEach(b=>b.onclick=()=>toggleLike(Number(b.dataset.like)));
  feed.querySelectorAll('[data-follow]').forEach(b=>b.onclick=()=>toggleFollow(b.dataset.follow));
  feed.querySelectorAll('[data-comment-form]').forEach(f=>f.onsubmit=async e=>{e.preventDefault();await addComment(Number(f.dataset.commentForm),f.querySelector('input').value);});
}

function renderPost(p){
  const profile=p.profiles||{}; const likes=p.likes||[]; const liked=session&&likes.some(x=>x.user_id===session.user.id);
  const avatar=(profile.display_name||profile.username||'?').slice(0,1).toUpperCase();
  const media=p.media_type==='image'&&p.media_url?`<img class="postMedia" src="${escapeAttr(p.media_url)}" alt="LarpTok post">`:p.media_type==='video'&&p.media_url?`<video class="postMedia" src="${escapeAttr(p.media_url)}" controls playsinline></video>`:'';
  const comments=(p.comments||[]).slice(-3).map(c=>`<div class="comment"><b>@${escapeHtml(c.profiles?.username||'user')}</b> ${escapeHtml(c.body)}</div>`).join('');
  return `<article class="post"><div class="postHead"><div class="avatar">${escapeHtml(avatar)}</div><div><div class="name">${escapeHtml(profile.display_name||profile.username||'LARPer')}</div><div class="handle">@${escapeHtml(profile.username||'user')}</div></div>${session&&session.user.id!==p.user_id?`<button class="ghost" style="margin-left:auto" data-follow="${p.user_id}">Follow</button>`:''}</div>${media}<div class="postBody"><div>${escapeHtml(p.caption||'')}</div></div><div class="actions"><button class="action ${liked?'liked':''}" data-like="${p.id}">♥ ${likes.length}</button><button class="action">💬 ${(p.comments||[]).length}</button><button class="action">↗ Share</button><button class="action">🔖 Save</button></div>${comments}<form class="commentBox" data-comment-form="${p.id}"><input placeholder="Add a comment…" maxlength="1000" ${session?'':'disabled'}><button class="primary" ${session?'':'disabled'}>Post</button></form></article>`;
}

async function toggleLike(postId){
  if(!session){$('authPanel').classList.remove('hidden');return;}
  const {data}=await db.from('likes').select('post_id').eq('post_id',postId).eq('user_id',session.user.id).maybeSingle();
  if(data) await db.from('likes').delete().eq('post_id',postId).eq('user_id',session.user.id);
  else await db.from('likes').insert({post_id:postId,user_id:session.user.id});
  loadFeed();
}
async function toggleFollow(userId){
  if(!session)return;
  const {data}=await db.from('follows').select('follower_id').eq('follower_id',session.user.id).eq('following_id',userId).maybeSingle();
  if(data) await db.from('follows').delete().eq('follower_id',session.user.id).eq('following_id',userId);
  else await db.from('follows').insert({follower_id:session.user.id,following_id:userId});
  loadFeed();
}
async function addComment(postId,body){
  if(!session||!body.trim())return;
  const {error}=await db.from('comments').insert({post_id:postId,user_id:session.user.id,body:body.trim()});
  if(error)alert(error.message);else loadFeed();
}
function escapeHtml(s){return String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));}
function escapeAttr(s){return escapeHtml(s).replace(/`/g,'&#96;');}
init();