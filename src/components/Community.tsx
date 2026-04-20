'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { COUNTRIES } from '@/lib/travel-data';

export interface CommunityComment {
  id: string;
  authorSub: string;
  authorName: string;
  authorPicture?: string;
  body: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  authorSub: string;
  authorName: string;
  authorPicture?: string;
  countryCode?: string;
  title: string;
  body: string;
  likes: string[]; // authorSub list
  comments: CommunityComment[];
  createdAt: string;
}

const STORAGE_KEY = 'tripb_community_posts_v1';

export function loadPosts(): CommunityPost[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}
function savePosts(posts: CommunityPost[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  try { window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY })); } catch {}
}

export function useCommunityPosts() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  useEffect(() => {
    setPosts(loadPosts());
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key !== STORAGE_KEY) return;
      setPosts(loadPosts());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  return {
    posts,
    setPosts: (next: CommunityPost[]) => { setPosts(next); savePosts(next); },
  };
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
}

export default function Community({ initialAuthorSub }: Props) {
  const { user } = useAuth();
  const { posts, setPosts } = useCommunityPosts();
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [countryFilter, setCountryFilter] = useState<string>('');
  const [authorFilter, setAuthorFilter] = useState<string>(initialAuthorSub ?? '');

  const filtered = useMemo(() => {
    return posts
      .filter(p => !countryFilter || p.countryCode === countryFilter)
      .filter(p => !authorFilter || p.authorSub === authorFilter)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [posts, countryFilter, authorFilter]);

  const selectedPost = selectedId ? posts.find(p => p.id === selectedId) : null;

  const savePost = (p: CommunityPost) => {
    const idx = posts.findIndex(x => x.id === p.id);
    const next = idx >= 0 ? posts.map(x => x.id === p.id ? p : x) : [...posts, p];
    setPosts(next);
  };

  const deletePost = (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    setPosts(posts.filter(p => p.id !== id));
    if (selectedId === id) { setSelectedId(null); setView('list'); }
  };

  const toggleLike = (postId: string) => {
    if (!user) return;
    setPosts(posts.map(p => {
      if (p.id !== postId) return p;
      const has = p.likes.includes(user.sub);
      return { ...p, likes: has ? p.likes.filter(s => s !== user.sub) : [...p.likes, user.sub] };
    }));
  };

  const addComment = (postId: string, body: string) => {
    if (!user || !body.trim()) return;
    const c: CommunityComment = {
      id: crypto.randomUUID(),
      authorSub: user.sub,
      authorName: user.name,
      authorPicture: user.picture,
      body: body.trim(),
      createdAt: new Date().toISOString(),
    };
    setPosts(posts.map(p => p.id === postId ? { ...p, comments: [...p.comments, c] } : p));
  };

  if (view === 'detail' && selectedPost) {
    return (
      <PostDetail
        post={selectedPost}
        currentUserSub={user?.sub}
        onBack={() => { setSelectedId(null); setView('list'); }}
        onToggleLike={() => toggleLike(selectedPost.id)}
        onAddComment={(body) => addComment(selectedPost.id, body)}
        onDelete={() => deletePost(selectedPost.id)}
      />
    );
  }

  if (view === 'create') {
    if (!user) return null;
    return (
      <PostForm
        user={user}
        onSave={(p) => { savePost(p); setView('list'); }}
        onCancel={() => setView('list')}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-100">💬 여행 커뮤니티</h2>
          <p className="text-xs text-slate-500 mt-0.5">다른 여행자의 일정·후기를 살펴보고 이야기를 나눠보세요</p>
        </div>
        {user && (
          <button
            onClick={() => setView('create')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
          >
            + 글쓰기
          </button>
        )}
      </div>

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
  post, currentUserSub, onBack, onToggleLike, onAddComment, onDelete,
}: {
  post: CommunityPost;
  currentUserSub?: string;
  onBack: () => void;
  onToggleLike: () => void;
  onAddComment: (body: string) => void;
  onDelete: () => void;
}) {
  const [comment, setComment] = useState('');
  const country = COUNTRIES.find(c => c.code === post.countryCode);
  const liked = currentUserSub ? post.likes.includes(currentUserSub) : false;
  const mine = currentUserSub === post.authorSub;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-slate-400 hover:text-slate-200 text-sm transition-colors">← 목록</button>
        {mine && (
          <button onClick={onDelete} className="text-xs text-red-400 hover:text-red-300 px-2.5 py-1 rounded-lg border border-red-800/50 hover:bg-red-900/20 transition-all">
            삭제
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
            <p className="text-sm font-medium text-slate-200">{post.authorName}</p>
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
          <div className="flex gap-2">
            <input
              type="text"
              value={comment}
              onChange={e => setComment(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && comment.trim()) { onAddComment(comment); setComment(''); } }}
              placeholder="댓글을 남겨보세요"
              className="flex-1 bg-slate-700/50 border border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={() => { if (comment.trim()) { onAddComment(comment); setComment(''); } }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm transition-colors"
            >등록</button>
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
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-slate-200">{c.authorName}</span>
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

function PostForm({
  user, onSave, onCancel,
}: {
  user: { sub: string; name: string; picture?: string };
  onSave: (p: CommunityPost) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [countryCode, setCountryCode] = useState('');

  const handleSave = () => {
    if (!title.trim() || !body.trim()) return;
    onSave({
      id: crypto.randomUUID(),
      authorSub: user.sub,
      authorName: user.name,
      authorPicture: user.picture,
      countryCode: countryCode || undefined,
      title: title.trim(),
      body: body.trim(),
      likes: [],
      comments: [],
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700/60 space-y-3 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-100">새 글 쓰기</h2>
        <button onClick={onCancel} className="text-slate-500 hover:text-slate-300">✕</button>
      </div>

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

      <p className="text-[10px] text-slate-600 pt-1">
        * 현재 커뮤니티는 브라우저 내 저장으로 프리뷰 중입니다. 공유 서버 연동 예정.
      </p>
    </div>
  );
}
