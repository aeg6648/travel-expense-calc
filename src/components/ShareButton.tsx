'use client';

import { useState } from 'react';

interface Props {
  title: string;
  text: string;
  url?: string;
  className?: string;
}

export default function ShareButton({ title, text, url, className = '' }: Props) {
  const [copied, setCopied] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  const shareUrl = url ?? (typeof window !== 'undefined' ? window.location.href : 'https://www.tripbudget.my');

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, text, url: shareUrl });
        return;
      } catch {
        // User cancelled or share failed — fall through to fallback
      }
    }
    setShowFallback(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${text}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard might be blocked; ignore
    }
  };

  const openKakao = () => {
    const kakaoUrl = `https://story.kakao.com/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
    window.open(kakaoUrl, '_blank', 'noopener,noreferrer,width=600,height=600');
  };

  const openTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer,width=600,height=600');
  };

  const openFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbUrl, '_blank', 'noopener,noreferrer,width=600,height=600');
  };

  return (
    <>
      <button
        type="button"
        onClick={handleShare}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors shadow-lg shadow-indigo-900/30 ${className}`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        친구에게 공유
      </button>

      {showFallback && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowFallback(false)}
        >
          <div
            className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-slate-100 mb-4">공유하기</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <button
                type="button"
                onClick={openKakao}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-[#3c1e1e] transition-colors"
              >
                <span className="text-xl">💬</span>
                <span className="text-xs font-semibold">카카오</span>
              </button>
              <button
                type="button"
                onClick={openTwitter}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-900 hover:bg-slate-700 text-white border border-slate-600 transition-colors"
              >
                <span className="text-xl">𝕏</span>
                <span className="text-xs font-semibold">X/트위터</span>
              </button>
              <button
                type="button"
                onClick={openFacebook}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              >
                <span className="text-xl">f</span>
                <span className="text-xs font-semibold">페이스북</span>
              </button>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-700">
              <input
                readOnly
                value={shareUrl}
                className="flex-1 bg-transparent px-2 text-xs text-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={copyToClipboard}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
              >
                {copied ? '복사됨 ✓' : '복사'}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowFallback(false)}
              className="w-full mt-4 py-2 rounded-xl text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  );
}
