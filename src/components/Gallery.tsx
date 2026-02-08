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

function allCategoriesAndTags(prompts: PromptItem[]) {
  const categories = new Set<string>();
  const tags = new Set<string>();
  prompts.forEach((item: PromptItem) => {
    categories.add(item.category);
    item.tags.forEach((t: string) => tags.add(t));
  });
  return {
    categories: Array.from(categories),
    tags: Array.from(tags)
  };
}

export default function Gallery() {
  // filtering
  const [category, setCategory] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);
  const { categories, tags } = useMemo(() => allCategoriesAndTags(prompts), []);

  const filtered = useMemo(() => {
    return prompts.filter((item) => {
      return (
        (!category || item.category === category) &&
        (!tag || item.tags.includes(tag))
      );
    });
  }, [category, tag]);

  return (
    <>
      <div className="filter-bar">
        <button onClick={() => setCategory(null)} className={category===null ? "tag selected" : "tag"}>全カテゴリ</button>
        {categories.map((cat) => (
          <button onClick={() => setCategory(cat)} key={cat} className={category===cat ? "tag selected" : "tag"}>{cat}</button>
        ))}
        <span style={{ marginLeft: '1.2em' }} />
        <button onClick={() => setTag(null)} className={tag===null ? "tag selected" : "tag"}>全タグ</button>
        {tags.map((tg) => (
          <button onClick={() => setTag(tg)} key={tg} className={tag===tg ? "tag selected" : "tag"}>{tg}</button>
        ))}
      </div>
      <div className="gallery-grid">
        {filtered.map(item => (
          <div className="card" key={item.id} tabIndex={0}>
            <img src={item.imageUrl} alt="prompt artwork" className="card-image" loading="lazy" />
            <div className="card-details">
              <div style={{fontWeight:700,marginBottom:4}}>{item.category}</div>
              <div>{item.prompt}</div>
              <div className="tags">
                {item.tags.map((tg) => (
                  <span className="tag" key={tg}>{tg}</span>
                ))}
              </div>
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
