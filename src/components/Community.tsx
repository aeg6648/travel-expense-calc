'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { COUNTRIES } from '@/lib/travel-data';
import { importTripToMine, loadTrips, sumInCurrency, type Trip, type Activity } from '@/components/ItineraryManager';
import { isAdminEmail } from '@/lib/admin';

export interface CommunityComment {
  id: string;
  authorSub: string;
  authorName: string;      // display name (real or nickname)
  authorPicture?: string;
  authorEmail?: string;    // only revealed in UI to admins
  anonymous?: boolean;     // true when the user chose to post under a nickname
  body: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  authorSub: string;
  authorName: string;      // display name (real or nickname)
  authorPicture?: string;
  authorEmail?: string;    // only revealed in UI to admins
  anonymous?: boolean;     // true when posted under a nickname
  countryCode?: string;
  title: string;
  body: string;
  likes: string[]; // authorSub list
  comments: CommunityComment[];
  createdAt: string;
  sharedTrip?: Trip; // snapshot of the author's saved itinerary at post time
  kind?: 'post' | 'qna'; // feed post vs. question to admin
}

const STORAGE_KEY = 'tripb_community_posts_v1';

function loadLocalPosts(): CommunityPost[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}
function saveLocalPosts(posts: CommunityPost[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

type Source = 'server' | 'local' | 'loading';

interface Store {
  posts: CommunityPost[];
  source: Source;
  createPost: (p: CommunityPost) => Promise<void>;
  deletePost: (id: string, userSub: string) => Promise<void>;
  toggleLike: (id: string, userSub: string) => Promise<void>;
  addComment: (id: string, comment: CommunityComment) => Promise<void>;
}

export function useCommunityPosts(): Store {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [source, setSource] = useState<Source>('loading');

  // Initial fetch: try server → fallback to localStorage
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/community/posts');
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            const serverPosts = (data.posts ?? []) as CommunityPost[];
            setPosts(serverPosts);
            setSource('server');
            saveLocalPosts(serverPosts); // cache for offline read
            return;
          }
        }
      } catch { /* ignore */ }
      if (!cancelled) {
        setPosts(loadLocalPosts());
        setSource('local');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Mutators apply locally first, then sync to server (if available).
  const applyLocal = (next: CommunityPost[]) => {
    setPosts(next);
    saveLocalPosts(next);
  };

  const refetchOrFallback = async () => {
    try {
      const res = await fetch('/api/community/posts');
      if (res.ok) {
        const data = await res.json();
        const serverPosts = (data.posts ?? []) as CommunityPost[];
        setPosts(serverPosts);
        saveLocalPosts(serverPosts);
        setSource('server');
        return true;
      }
    } catch { /* ignore */ }
    return false;
  };

  const createPost = async (p: CommunityPost) => {
    applyLocal([p, ...posts]);
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p),
      });
      if (res.ok) await refetchOrFallback(); else setSource('local');
    } catch { setSource('local'); }
  };

  const deletePost = async (id: string, userSub: string) => {
    applyLocal(posts.filter(x => x.id !== id));
    try {
      const res = await fetch(`/api/community/posts/${id}`, {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userSub }),
      });
      if (res.ok) await refetchOrFallback(); else setSource('local');
    } catch { setSource('local'); }
  };

  const toggleLike = async (id: string, userSub: string) => {
    const next = posts.map(p => {
      if (p.id !== id) return p;
      const has = p.likes.includes(userSub);
      return { ...p, likes: has ? p.likes.filter(s => s !== userSub) : [...p.likes, userSub] };
    });
    applyLocal(next);
    try {
      await fetch(`/api/community/posts/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'toggleLike', userSub }),
      });
    } catch { /* offline: local state already updated */ }
  };

  const addComment = async (id: string, comment: CommunityComment) => {
    applyLocal(posts.map(p => p.id === id ? { ...p, comments: [...p.comments, comment] } : p));
    try {
      await fetch(`/api/community/posts/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'addComment', comment }),
      });
    } catch { /* offline: local state already updated */ }
  };

  return { posts, source, createPost, deletePost, toggleLike, addComment };
}

function SharedTripCard({ trip, compact, onImport, importing }: { trip: Trip; compact?: boolean; onImport?: () => void; importing?: boolean }) {
  const country = COUNTRIES.find(c => c.code === trip.countryCode);
  const totalCost = sumInCurrency(trip.activities, trip.currency);
  const days = trip.startDate && trip.endDate
    ? Math.max(1, Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000))
    : 1;
  // Group activities per day for preview
  const byDay = new Map<number, Activity[]>();
  for (const a of trip.activities) {
    if (!byDay.has(a.day)) byDay.set(a.day, []);
    byDay.get(a.day)!.push(a);
  }
  for (const list of byDay.values()) {
    list.sort((x, y) => {
      if (x.order !== undefined && y.order !== undefined) return x.order - y.order;
      return (x.time || '').localeCompare(y.time || '');
    });
  }
  const orderedDays = Array.from(byDay.keys()).sort((a, b) => a - b);

  return (
    <div className={`rounded-2xl border border-indigo-700/40 bg-indigo-900/10 overflow-hidden ${compact ? 'mt-2' : ''}`}>
      <div className="flex items-center gap-2 px-4 py-3 bg-indigo-900/20 border-b border-indigo-700/30">
        <span className="text-xl">{country?.flag ?? '🌍'}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-100 truncate">📅 {trip.name}</p>
          <p className="text-[11px] text-slate-400">
            {country?.nameKR ?? trip.countryCode}
            {trip.startDate && trip.endDate && ` · ${trip.startDate} ~ ${trip.endDate}`}
            {` · ${days}박 ${days + 1}일`}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] text-slate-500">활동 {trip.activities.length}개</p>
          {totalCost > 0 && (
            <p className="text-xs font-semibold text-indigo-300">
              {trip.currency === 'KRW' ? `${(totalCost / 10000).toLocaleString()}만원` : `${totalCost.toLocaleString()} ${trip.currency}`}
            </p>
          )}
        </div>
      </div>
      {!compact && orderedDays.length > 0 && (
        <div className="px-4 py-3 space-y-2.5 max-h-96 overflow-auto">
          {orderedDays.map(d => {
            const stops = byDay.get(d)!.filter(a => a.location);
            const routeHref = stops.length >= 2
              ? (() => {
                  const enc = (a: Activity) => a.locationPlaceId ? `place_id:${a.locationPlaceId}` : encodeURIComponent(a.location);
                  const origin = enc(stops[0]);
                  const dest = enc(stops[stops.length - 1]);
                  const waypoints = stops.slice(1, -1).map(enc).join('|');
                  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}`;
                  if (waypoints) url += `&waypoints=${waypoints}`;
                  return url;
                })()
              : null;
            return (
            <div key={d}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] font-semibold text-indigo-300">Day {d}</p>
                {routeHref && (
                  <a
                    href={routeHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] px-2 py-0.5 rounded-full border border-indigo-700/50 text-indigo-300 hover:bg-indigo-900/30 transition-colors"
                  >🗺 동선 보기</a>
                )}
              </div>
              <div className="space-y-2 pl-2 border-l border-indigo-700/30">
                {byDay.get(d)!.map(a => {
                  const mapsHref = a.locationPlaceId
                    ? `https://www.google.com/maps/place/?q=place_id:${a.locationPlaceId}`
                    : a.location
                      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.location)}`
                      : null;
                  return (
                  <div key={a.id} className="text-[11px] text-slate-300">
                    <div className="flex items-center gap-2">
                      {a.time && <span className="text-slate-500 tabular-nums shrink-0">{a.time}</span>}
                      <span className="truncate">{a.title}</span>
                      {a.cost > 0 && (
                        <span className="text-slate-500 ml-auto shrink-0">
                          {a.currency === 'KRW' ? `${(a.cost / 10000).toLocaleString()}만` : `${a.cost.toLocaleString()}`}
                        </span>
                      )}
                    </div>
                    {a.location && (
                      mapsHref ? (
                        <a
                          href={mapsHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="ml-[3.5rem] inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-indigo-300 transition-colors"
                        >
                          <span>📍</span>
                          <span className="truncate max-w-[200px]">{a.location}</span>
                          <span className="opacity-60">↗</span>
                        </a>
                      ) : (
                        <p className="ml-[3.5rem] text-[10px] text-slate-500 truncate">📍 {a.location}</p>
                      )
                    )}
                  </div>
                );})}
              </div>
            </div>
            );
          })}
        </div>
      )}
      {compact && (
        <div className="px-4 py-2 text-[11px] text-slate-400">
          첨부됐어요 — 글을 열면 하루별 활동을 모두 볼 수 있어요.
        </div>
      )}
      {!compact && onImport && (
        <div className="border-t border-indigo-700/30 px-4 py-3 bg-indigo-900/15 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-indigo-200">이 일정, 내 여행으로 가져갈래요?</p>
            <p className="text-[11px] text-indigo-300/80 mt-0.5">복사본이 내 일정 목록에 생겨서 자유롭게 수정할 수 있어요.</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onImport(); }}
            disabled={importing}
            className="shrink-0 text-xs px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold transition-colors"
          >
            {importing ? '가져오는 중…' : '⬇ 내 일정으로'}
          </button>
        </div>
      )}
    </div>
  );
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return '방금';
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}분 전`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}시간 전`;
  if (diff < 604800_000) return `${Math.floor(diff / 86400_000)}일 전`;
  return new Date(iso).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

interface Props {
  initialAuthorSub?: string; // when opened from profile, filter to that user's posts
  initialKind?: 'post' | 'qna';
}

export default function Community({ initialAuthorSub, initialKind }: Props) {
  const { user } = useAuth();
  const store = useCommunityPosts();
  const { posts, source } = store;
  const isAdmin = isAdminEmail(user?.email);
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [countryFilter, setCountryFilter] = useState<string>('');
  const [authorFilter, setAuthorFilter] = useState<string>(initialAuthorSub ?? '');
  const [boardKind, setBoardKind] = useState<'post' | 'qna'>(initialKind ?? 'post');

  const filtered = useMemo(() => {
    return posts
      .filter(p => (p.kind ?? 'post') === boardKind)
      .filter(p => !countryFilter || p.countryCode === countryFilter)
      .filter(p => !authorFilter || p.authorSub === authorFilter)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [posts, countryFilter, authorFilter, boardKind]);

  const selectedPost = selectedId ? posts.find(p => p.id === selectedId) : null;

  const savePost = async (p: CommunityPost) => {
    await store.createPost(p);
  };

  const deletePost = async (id: string) => {
    if (!user) return;
    if (!confirm('정말 삭제하시겠습니까?')) return;
    // Admins bypass authorSub check on the server by passing authorSub of
    // the post itself. (Server currently only blocks mismatched userSub —
    // upgrade once a real ID-token check lands.)
    let deleteAs = user.sub;
    if (isAdmin) {
      const target = posts.find(p => p.id === id);
      if (target) deleteAs = target.authorSub;
    }
    await store.deletePost(id, deleteAs);
    if (selectedId === id) { setSelectedId(null); setView('list'); }
  };

  const toggleLike = (postId: string) => {
    if (!user) return;
    store.toggleLike(postId, user.sub);
  };

  const addComment = (postId: string, body: string, asAnonymous: boolean, nick: string) => {
    if (!user || !body.trim()) return;
    const anon = asAnonymous;
    const displayName = anon ? (nick.trim() || '익명의 여행자') : user.name;
    if (anon && nick.trim()) {
      try { localStorage.setItem('tripb_community_nickname_v1', nick.trim()); } catch { /* ignore */ }
    }
    const c: CommunityComment = {
      id: crypto.randomUUID(),
      authorSub: user.sub,
      authorName: displayName,
      authorPicture: anon ? undefined : user.picture,
      authorEmail: user.email,
      anonymous: anon,
      body: body.trim(),
      createdAt: new Date().toISOString(),
    };
    store.addComment(postId, c);
  };

  if (view === 'detail' && selectedPost) {
    return (
      <PostDetail
        post={selectedPost}
        currentUserSub={user?.sub}
        isAdmin={isAdmin}
        onBack={() => { setSelectedId(null); setView('list'); }}
        onToggleLike={() => toggleLike(selectedPost.id)}
        onAddComment={(body, anon, nick) => addComment(selectedPost.id, body, anon, nick)}
        onDelete={() => deletePost(selectedPost.id)}
      />
    );
  }

  if (view === 'create') {
    if (!user) return null;
    return (
      <PostForm
        user={{ sub: user.sub, name: user.name, picture: user.picture, email: user.email }}
        defaultKind={boardKind}
        onSave={(p) => { savePost(p); setView('list'); }}
        onCancel={() => setView('list')}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-start gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              {boardKind === 'qna' ? '❓ 문의 / Q&A 게시판' : '💬 여행 커뮤니티'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {boardKind === 'qna'
                ? '관리자에게 직접 질문해보세요. 답변은 이 게시판에 공개됩니다.'
                : '다른 여행자의 일정·후기를 살펴보고 이야기를 나눠보세요'}
            </p>
          </div>
          {source === 'server' && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/30 border border-emerald-700/50 text-emerald-400" title="Vercel KV 연결됨">
              🟢 서버
            </span>
          )}
          {source === 'local' && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-900/30 border border-amber-700/50 text-amber-400" title="서버 미설정 — 브라우저 내에만 저장됨">
              🟡 로컬
            </span>
          )}
          {isAdmin && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-900/40 border border-indigo-500/60 text-indigo-200" title="관리자 계정">
              🛡️ 관리자
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && boardKind === 'post' && (
            <button
              onClick={async () => {
                if (!user) return;
                if (!confirm('유명인 기반 샘플 글 20개를 피드에 추가할까요? (이미 존재하면 덮어씁니다)')) return;
                try {
                  const res = await fetch('/api/community/seed', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: user.email, sub: user.sub, name: user.name, picture: user.picture, replace: true }),
                  });
                  const data = await res.json();
                  if (res.ok) {
                    alert(`✅ ${data.inserted}/${data.total}개 추가됨`);
                    window.location.reload();
                  } else {
                    alert(`❌ 실패: ${data.error ?? 'unknown'}`);
                  }
                } catch (e) { alert(`❌ ${(e as Error).message}`); }
              }}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-pink-600 text-white text-xs font-semibold transition-opacity hover:opacity-90"
              title="관리자 전용: 유명인 여행지 기반 샘플 글 20개 시드"
            >
              🌱 시드
            </button>
          )}
          {user && (
            <button
              onClick={() => setView('create')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
            >
              {boardKind === 'qna' ? '+ 문의하기' : '+ 글쓰기'}
            </button>
          )}
        </div>
      </div>

      {/* Board kind tab switch */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-800/60 border border-slate-700/60 w-fit">
        {([
          { id: 'post', label: '📰 피드' },
          { id: 'qna',  label: '❓ Q&A 문의' },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setBoardKind(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              boardKind === t.id
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >{t.label}</button>
        ))}
      </div>

      {boardKind === 'post' && (
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setCountryFilter('')}
          className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${!countryFilter ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-700/50 text-slate-400 border-slate-600 hover:text-slate-200'}`}
        >전체</button>
        {COUNTRIES.map(c => (
          <button
            key={c.code}
            onClick={() => setCountryFilter(countryFilter === c.code ? '' : c.code)}
            className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${countryFilter === c.code ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-700/50 text-slate-400 border-slate-600 hover:text-slate-200'}`}
          >{c.flag} {c.nameKR}</button>
        ))}
        {authorFilter && (
          <button
            onClick={() => setAuthorFilter('')}
            className="ml-2 px-2.5 py-1 text-xs rounded-full border border-amber-700/50 bg-amber-900/20 text-amber-300"
          >✕ 내 글만 보기 해제</button>
        )}
      </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/50 rounded-2xl border border-slate-700/60">
          <p className="text-4xl mb-3">🗨️</p>
          <p className="text-sm text-slate-400">{authorFilter ? '작성한 글이 없습니다' : '아직 글이 없어요'}</p>
          {!authorFilter && <p className="text-xs mt-1 text-slate-500">첫 글을 남겨보세요</p>}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(p => {
            const country = COUNTRIES.find(c => c.code === p.countryCode);
            const liked = user ? p.likes.includes(user.sub) : false;
            return (
              <button
                key={p.id}
                onClick={() => { setSelectedId(p.id); setView('detail'); }}
                className="w-full text-left p-4 rounded-2xl border border-slate-700/60 bg-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  {p.authorPicture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.authorPicture} alt="" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                      {p.authorName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-medium text-slate-300">{p.authorName}</span>
                  {p.anonymous && <span className="text-[9px] px-1.5 py-0 rounded bg-slate-700/70 text-slate-500">익명</span>}
                  {isAdmin && p.authorEmail && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-900/40 border border-indigo-700/50 text-indigo-300" title="관리자 전용">
                      🛡️ {p.authorEmail}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500">{formatRelative(p.createdAt)}</span>
                  {country && (
                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-400 border border-slate-700">
                      {country.flag} {country.nameKR}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-slate-100 mb-1">{p.title}</p>
                <p className="text-xs text-slate-400 line-clamp-2">{p.body}</p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                  <span className={liked ? 'text-pink-400' : ''}>{liked ? '♥' : '♡'} {p.likes.length}</span>
                  <span>💬 {p.comments.length}</span>
                  {p.sharedTrip && (
                    <span className="text-indigo-400">📅 일정 {p.sharedTrip.activities.length}개</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PostDetail({
  post, currentUserSub, isAdmin, onBack, onToggleLike, onAddComment, onDelete,
}: {
  post: CommunityPost;
  currentUserSub?: string;
  isAdmin?: boolean;
  onBack: () => void;
  onToggleLike: () => void;
  onAddComment: (body: string, anonymous: boolean, nickname: string) => void;
  onDelete: () => void;
}) {
  const [comment, setComment] = useState('');
  const [commentAnon, setCommentAnon] = useState(false);
  const [commentNick, setCommentNick] = useState('');
  const [importing, setImporting] = useState(false);
  useEffect(() => {
    try { setCommentNick(localStorage.getItem('tripb_community_nickname_v1') ?? ''); } catch { /* ignore */ }
  }, []);
  const country = COUNTRIES.find(c => c.code === post.countryCode);
  const liked = currentUserSub ? post.likes.includes(currentUserSub) : false;
  const mine = currentUserSub === post.authorSub;
  const canDelete = mine || isAdmin;
  const canImport = !!currentUserSub && !!post.sharedTrip;

  const handleImport = () => {
    if (!currentUserSub || !post.sharedTrip) return;
    setImporting(true);
    try {
      importTripToMine(currentUserSub, post.sharedTrip, { renameSuffix: ' (가져옴)' });
      setTimeout(() => {
        setImporting(false);
        if (confirm('✅ 내 여행 목록에 복사됐어요. 내 일정으로 이동할까요?')) {
          window.location.hash = '';
          // Navigate to itinerary — page.tsx listens for this custom event
          window.dispatchEvent(new CustomEvent('tripb-goto-itinerary'));
        }
      }, 120);
    } catch (e) {
      setImporting(false);
      alert(`❌ 가져오기 실패: ${(e as Error).message}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-slate-400 hover:text-slate-200 text-sm transition-colors">← 목록</button>
        {canDelete && (
          <button onClick={onDelete} className="text-xs text-red-400 hover:text-red-300 px-2.5 py-1 rounded-lg border border-red-800/50 hover:bg-red-900/20 transition-all">
            {!mine && isAdmin ? '🛡️ 관리자 삭제' : '삭제'}
          </button>
        )}
      </div>

      <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700/60 space-y-3">
        <div className="flex items-center gap-2">
          {post.authorPicture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.authorPicture} alt="" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
              {post.authorName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-sm font-medium text-slate-200">{post.authorName}</p>
              {post.anonymous && <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700/70 text-slate-500">익명</span>}
              {isAdmin && post.authorEmail && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-900/40 border border-indigo-700/50 text-indigo-300" title="관리자 전용">
                  🛡️ {post.authorEmail}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500">{formatRelative(post.createdAt)}</p>
          </div>
          {country && (
            <span className="ml-auto text-xs px-2.5 py-1 rounded-full bg-slate-700/60 text-slate-300 border border-slate-700">
              {country.flag} {country.nameKR}
            </span>
          )}
        </div>

        <h2 className="text-xl font-bold text-slate-100">{post.title}</h2>
        <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{post.body}</p>

        {post.sharedTrip && (
          <SharedTripCard
            trip={post.sharedTrip}
            onImport={canImport ? handleImport : undefined}
            importing={importing}
          />
        )}

        <div className="flex items-center gap-2 pt-2 border-t border-slate-700/60">
          <button
            onClick={onToggleLike}
            disabled={!currentUserSub}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
              liked ? 'bg-pink-900/30 border-pink-700/50 text-pink-300' : 'border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500'
            } disabled:opacity-50`}
          >
            <span>{liked ? '♥' : '♡'}</span>
            <span className="text-xs font-medium">{post.likes.length}</span>
          </button>
          <span className="text-xs text-slate-500">💬 {post.comments.length}개 댓글</span>
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700/60 space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">댓글</h3>
        {currentUserSub ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={e => setComment(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && comment.trim()) { onAddComment(comment, commentAnon, commentNick); setComment(''); } }}
                placeholder="댓글을 남겨보세요"
                className="flex-1 bg-slate-700/50 border border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => { if (comment.trim()) { onAddComment(comment, commentAnon, commentNick); setComment(''); } }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm transition-colors"
              >등록</button>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={commentAnon}
                  onChange={e => setCommentAnon(e.target.checked)}
                  className="rounded border-slate-600 bg-slate-700 focus:ring-indigo-500 w-3 h-3"
                />
                🎭 닉네임으로
              </label>
              {commentAnon && (
                <input
                  type="text"
                  value={commentNick}
                  onChange={e => setCommentNick(e.target.value.slice(0, 20))}
                  placeholder="닉네임"
                  className="flex-1 bg-slate-800/80 border border-slate-600 rounded-lg px-2 py-1 text-[11px] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500">로그인 후 댓글을 남길 수 있어요.</p>
        )}

        {post.comments.length === 0 ? (
          <p className="text-xs text-slate-600">아직 댓글이 없어요</p>
        ) : (
          <div className="space-y-2">
            {post.comments.map(c => (
              <div key={c.id} className="flex gap-2 p-2.5 rounded-xl bg-slate-700/30 border border-slate-700/40">
                {c.authorPicture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.authorPicture} alt="" className="w-6 h-6 rounded-full shrink-0" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                    {c.authorName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-medium text-slate-200">{c.authorName}</span>
                    {c.anonymous && <span className="text-[9px] px-1 py-0 rounded bg-slate-700/70 text-slate-500">익명</span>}
                    {isAdmin && c.authorEmail && (
                      <span className="text-[9px] px-1.5 py-0 rounded bg-indigo-900/40 border border-indigo-700/50 text-indigo-300" title="관리자 전용">
                        🛡️ {c.authorEmail}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500">{formatRelative(c.createdAt)}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 whitespace-pre-wrap">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const NICK_KEY = 'tripb_community_nickname_v1';

function PostForm({
  user, defaultKind, onSave, onCancel,
}: {
  user: { sub: string; name: string; picture?: string; email?: string };
  defaultKind: 'post' | 'qna';
  onSave: (p: CommunityPost) => void;
  onCancel: () => void;
}) {
  const kind = defaultKind;
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [myTrips, setMyTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [anonymous, setAnonymous] = useState(false);
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    setMyTrips(loadTrips(user.sub));
    try { setNickname(localStorage.getItem(NICK_KEY) ?? ''); } catch { /* ignore */ }
  }, [user.sub]);

  const selectedTrip = myTrips.find(t => t.id === selectedTripId);

  // Auto-fill country from chosen trip unless user already set one
  useEffect(() => {
    if (selectedTrip && !countryCode) setCountryCode(selectedTrip.countryCode);
  }, [selectedTrip, countryCode]);

  const handleSave = () => {
    if (!title.trim() || !body.trim()) return;
    const finalName = anonymous ? (nickname.trim() || '익명의 여행자') : user.name;
    if (anonymous) {
      try { localStorage.setItem(NICK_KEY, nickname.trim()); } catch { /* ignore */ }
    }
    onSave({
      id: crypto.randomUUID(),
      authorSub: user.sub,
      authorName: finalName,
      authorPicture: anonymous ? undefined : user.picture,
      authorEmail: user.email,
      anonymous,
      countryCode: countryCode || undefined,
      title: title.trim(),
      body: body.trim(),
      likes: [],
      comments: [],
      createdAt: new Date().toISOString(),
      sharedTrip: kind === 'post' && selectedTrip ? { ...selectedTrip } : undefined,
      kind,
    });
  };

  return (
    <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700/60 space-y-3 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-100">
          {kind === 'qna' ? '❓ 새 문의 작성' : '새 글 쓰기'}
        </h2>
        <button onClick={onCancel} className="text-slate-500 hover:text-slate-300">✕</button>
      </div>
      {kind === 'qna' && (
        <p className="text-[11px] text-indigo-300 bg-indigo-900/20 border border-indigo-700/40 rounded-lg px-3 py-2">
          🛡️ 관리자가 직접 답변합니다. 실명/이메일은 관리자만 볼 수 있어요.
        </p>
      )}

      {kind === 'post' && (
      <div>
        <label className="text-xs font-medium text-slate-400 block mb-1.5">관련 나라 (선택)</label>
        <select
          value={countryCode}
          onChange={e => setCountryCode(e.target.value)}
          className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
        >
          <option value="">선택 없음</option>
          {COUNTRIES.map(c => (
            <option key={c.code} value={c.code}>{c.flag} {c.nameKR}</option>
          ))}
        </select>
      </div>
      )}

      {kind === 'post' && (
      <div>
        <label className="text-xs font-medium text-slate-400 block mb-1.5">
          📅 내 일정 첨부 <span className="text-slate-600 font-normal">(선택 — 글과 함께 공유돼요)</span>
        </label>
        {myTrips.length === 0 ? (
          <p className="text-[11px] text-slate-600 px-3 py-2 rounded-xl bg-slate-700/30 border border-dashed border-slate-700">
            저장된 여행이 없어요. 먼저 내 여행 일정에서 일정을 만들어보세요.
          </p>
        ) : (
          <select
            value={selectedTripId}
            onChange={e => setSelectedTripId(e.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            <option value="">첨부하지 않기</option>
            {myTrips.map(t => {
              const country = COUNTRIES.find(c => c.code === t.countryCode);
              return (
                <option key={t.id} value={t.id}>
                  {country?.flag ?? '🌍'} {t.name} — {t.activities.length}개 활동
                </option>
              );
            })}
          </select>
        )}
        {selectedTrip && <SharedTripCard trip={selectedTrip} compact />}
      </div>
      )}

      <div>
        <label className="text-xs font-medium text-slate-400 block mb-1.5">제목</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="예) 2박3일 도쿄 다녀왔어요"
          className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="rounded-xl border border-slate-700/60 bg-slate-700/20 px-3 py-2.5">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={e => setAnonymous(e.target.checked)}
            className="rounded border-slate-600 bg-slate-700 focus:ring-indigo-500"
          />
          <span className="text-xs text-slate-300">🎭 닉네임으로 익명 글쓰기</span>
        </label>
        {anonymous && (
          <input
            type="text"
            value={nickname}
            onChange={e => setNickname(e.target.value.slice(0, 20))}
            placeholder="예) 방콕러버, 서울탈출러 (최대 20자)"
            className="mt-2 w-full bg-slate-800/80 border border-slate-600 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        )}
        <p className="text-[10px] text-slate-500 mt-1.5">
          {anonymous
            ? '실명과 프로필 사진 대신 닉네임으로 글이 올라가요.'
            : `지금은 ${user.name}님 이름으로 올라갑니다.`}
        </p>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-400 block mb-1.5">내용</label>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={8}
          placeholder="일정, 팁, 경비, 맛집 등 자유롭게 공유해보세요"
          className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 text-sm hover:bg-slate-700 transition-colors">취소</button>
        <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">등록</button>
      </div>

    </div>
  );
}
