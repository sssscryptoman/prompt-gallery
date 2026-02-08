import type { Metadata } from "next";
import "@/styles/globals.css";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  weight: ["400", "700"],
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "Prompt Gallery",
  description: "画像・動画生成プロンプトのアートギャラリー"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="dark">
      <body className={roboto.className}>{children}</body>
    </html>
  );
}
