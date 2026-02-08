"use client";
import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
import prompts from "@/data/prompts.json";

interface PromptItem {
  id: string;
  imageUrl: string;
  prompt: string;
  category: string;
  tags: string[];
  twitterUrl: string;
}

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (el?: HTMLElement) => void;
        createTweet: (id: string, el: HTMLElement, options?: Record<string, unknown>) => Promise<HTMLElement>;
      };
    };
  }
}

function allCategories(items: PromptItem[]) {
  const categories = new Set<string>();
  items.forEach((item: PromptItem) => {
    categories.add(item.category);
  });
  return Array.from(categories);
}

function extractTweetId(url: string): string | null {
  const match = url.match(/status\/(\d+)/);
  return match ? match[1] : null;
}

export default function Gallery() {
  const [category, setCategory] = useState<string | null>(null);
  const [modalItem, setModalItem] = useState<PromptItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const categories = useMemo(() => allCategories(prompts), []);
  const twitterEmbedRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    return prompts.filter((item) => {
      return !category || item.category === category;
    });
  }, [category]);

  // Load Twitter widgets.js once
  useEffect(() => {
    if (document.getElementById("twitter-wjs")) return;
    const script = document.createElement("script");
    script.id = "twitter-wjs";
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    document.head.appendChild(script);
  }, []);

  // Close modal with ESC key
  useEffect(() => {
    if (!showModal) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowModal(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showModal]);

  // Render Twitter embed when modal opens
  useEffect(() => {
    if (!showModal || !modalItem || !twitterEmbedRef.current) return;

    const container = twitterEmbedRef.current;
    container.innerHTML = '<div style="color:#888;text-align:center;padding:1em;">X投稿を読み込み中...</div>';

    const tweetId = extractTweetId(modalItem.twitterUrl);
    if (!tweetId) {
      container.innerHTML = '<div style="color:#888;text-align:center;padding:1em;">投稿IDを取得できませんでした</div>';
      return;
    }

    function tryCreateTweet() {
      if (window.twttr && window.twttr.widgets && window.twttr.widgets.createTweet) {
        container.innerHTML = "";
        window.twttr.widgets.createTweet(tweetId!, container, {
          theme: "dark",
          align: "center",
          dnt: true,
        }).then((el: HTMLElement | null) => {
          if (!el) {
            container.innerHTML = `<div style="text-align:center;padding:1em;"><a href="${modalItem!.twitterUrl}" target="_blank" rel="noopener noreferrer" style="color:#6fe3ff;">元のX投稿を見る →</a></div>`;
          }
        }).catch(() => {
          container.innerHTML = `<div style="text-align:center;padding:1em;"><a href="${modalItem!.twitterUrl}" target="_blank" rel="noopener noreferrer" style="color:#6fe3ff;">元のX投稿を見る →</a></div>`;
        });
      } else {
        setTimeout(tryCreateTweet, 300);
      }
    }

    tryCreateTweet();
  }, [showModal, modalItem]);

  // Copy to clipboard
  const handleCopy = useCallback((text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  }, []);

  // Click overlay closes modal
  const overlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) setShowModal(false);
  };

  return (
    <>
      <div className="filter-bar">
        <button onClick={() => setCategory(null)} className={category === null ? "tag selected" : "tag"}>すべて</button>
        {categories.map((cat) => (
          <button onClick={() => setCategory(cat)} key={cat} className={category === cat ? "tag selected" : "tag"}>{cat}</button>
        ))}
      </div>
      <div className="gallery-grid">
        {filtered.map(item => (
          <div className="card" key={item.id} tabIndex={0}
            onClick={() => { setModalItem(item); setShowModal(true); }}
          >
            <img src={item.imageUrl} alt="prompt artwork" className="card-image" loading="lazy" />
            <div className="card-details">
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{item.category}</div>
              <div style={{ fontSize: "0.9em" }}>{item.prompt.length > 120 ? item.prompt.slice(0, 120) + "..." : item.prompt}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && modalItem && (
        <div className="modal-overlay" onClick={overlayClick}>
          <div className="modal-content">
            <button className="modal-close-btn" aria-label="Close" onClick={() => setShowModal(false)}>×</button>
            <div className="modal-category">{modalItem.category}</div>
            <div className="modal-prompt">
              <button className="copy-btn" onClick={() => handleCopy(modalItem.prompt)}>コピー</button>
              {modalItem.prompt}
            </div>
            {/* X埋め込みツイート */}
            <div ref={twitterEmbedRef} style={{ margin: "14px 0", minHeight: 140 }} />
          </div>
        </div>
      )}
    </>
  );
}
