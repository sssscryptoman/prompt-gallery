"use client";
import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
import prompts from "@/data/prompts.json";
import Script from "next/script";

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
    twttr?: any;
  }
}

function allCategories(prompts: PromptItem[]) {
  const categories = new Set<string>();
  prompts.forEach((item: PromptItem) => {
    categories.add(item.category);
  });
  return Array.from(categories);
}

export default function Gallery() {
  const [category, setCategory] = useState<string | null>(null);
  const [modalItem, setModalItem] = useState<PromptItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const categories = useMemo(() => allCategories(prompts), []);
  const twitterEmbedRef = useRef<HTMLDivElement>(null);
  const [widgetsLoaded, setWidgetsLoaded] = useState(false);

  const filtered = useMemo(() => {
    return prompts.filter((item) => {
      return !category || item.category === category;
    });
  }, [category]);

  // Close modal with ESC key
  useEffect(() => {
    if (!showModal) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowModal(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showModal]);

  // Modal Copy to Clipboard
  const handleCopy = useCallback((text:string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }, []);

  // Click overlay closes modal
  const overlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) setShowModal(false);
  };

  // Twitter widgets.js loaded
  useEffect(() => {
    if (window.twttr && window.twttr.widgets) {
      setWidgetsLoaded(true);
    } else {
      window.addEventListener("twttrLoaded", () => setWidgetsLoaded(true));
    }
  }, []);

  // Render Twitter embed when modal opens
  useEffect(() => {
    if (showModal && modalItem && twitterEmbedRef.current) {
      twitterEmbedRef.current.innerHTML = '';
      const blockquote = document.createElement("blockquote");
      blockquote.className = "twitter-tweet";
      const a = document.createElement("a");
      a.href = modalItem.twitterUrl;
      blockquote.appendChild(a);
      twitterEmbedRef.current.appendChild(blockquote);
      // Wait for widgets.js
      function renderWidget() {
        if (window.twttr && window.twttr.widgets && window.twttr.widgets.load) {
          window.twttr.widgets.load(twitterEmbedRef.current);
        } else {
          setTimeout(renderWidget, 120);
        }
      }
      renderWidget();
    }
  }, [showModal, modalItem]);

  return (
    <>
      {/* Twitter widgets.js */}
      <Script
        src="https://platform.twitter.com/widgets.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== "undefined" && window.twttr && window.twttr.widgets) {
            setWidgetsLoaded(true);
            // Maybe custom event for fallback listener
            window.dispatchEvent(new Event("twttrLoaded"));
          }
        }}
      />
      <div className="filter-bar">
        <button onClick={() => setCategory(null)} className={category===null ? "tag selected" : "tag"}>すべて</button>
        {categories.map((cat) => (
          <button onClick={() => setCategory(cat)} key={cat} className={category===cat ? "tag selected" : "tag"}>{cat}</button>
        ))}
      </div>
      <div className="gallery-grid">
        {filtered.map(item => (
          <div className="card" key={item.id} tabIndex={0}
            onClick={() => { setModalItem(item); setShowModal(true); }}
          >
            <img src={item.imageUrl} alt="prompt artwork" className="card-image" loading="lazy" />
            <div className="card-details">
              <div style={{fontWeight:700,marginBottom:4}}>{item.category}</div>
              <div>{item.prompt}</div>
              <div className="card-footer">
                <a href={item.twitterUrl} target="_blank" rel="noopener noreferrer">元X（Twitter）投稿へ</a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Overlay */}
      {showModal && modalItem && (
        <div className="modal-overlay open" onClick={overlayClick}>
          <div className="modal-content">
            <button className="modal-close-btn" aria-label="Close" onClick={() => setShowModal(false)}>×</button>
            <div className="modal-category">{modalItem.category}</div>
            <div className="modal-prompt" style={{position:'relative'}}>
              <button className="copy-btn" onClick={()=>handleCopy(modalItem.prompt)}>コピー</button>
              {modalItem.prompt}
            </div>
            {/* X埋め込みツイート表示 */}
            <div ref={twitterEmbedRef} style={{margin:'14px 0', minHeight:140}}/>
          </div>
        </div>
      )}
    </>
  );
}
