"use client";
import prompts from "@/data/prompts.json";
import { useMemo, useState } from "react";

interface PromptItem {
  id: string;
  imageUrl: string;
  prompt: string;
  category: string;
  tags: string[];
  twitterUrl: string;
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
  const categories = useMemo(() => allCategories(prompts), []);

  const filtered = useMemo(() => {
    return prompts.filter((item) => {
      return !category || item.category === category;
    });
  }, [category]);

  return (
    <>
      <div className="filter-bar">
        <button onClick={() => setCategory(null)} className={category===null ? "tag selected" : "tag"}>すべて</button>
        {categories.map((cat) => (
          <button onClick={() => setCategory(cat)} key={cat} className={category===cat ? "tag selected" : "tag"}>{cat}</button>
        ))}
      </div>
      <div className="gallery-grid">
        {filtered.map(item => (
          <div className="card" key={item.id} tabIndex={0}>
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
    </>
  );
}
