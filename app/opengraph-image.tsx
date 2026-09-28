import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { person } from "@/content/site";

export const alt = `${person.name}. Send the problem. Get back a system.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const gloock = await readFile(join(process.cwd(), "app", "fonts", "Gloock-Regular.ttf"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          color: "#111111",
          padding: "64px 72px",
          fontFamily: "Gloock",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, letterSpacing: 2, textTransform: "uppercase", fontFamily: "sans-serif" }}>
          <span>{person.name}</span>
          <span>Co-founder, CJ Studios</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 108, lineHeight: 1, letterSpacing: -2 }}>
          <span>Send the problem.</span>
          <span style={{ display: "flex" }}>
            Get back a&nbsp;
            <span style={{ background: "#FFE94D", padding: "0 12px" }}>system.</span>
          </span>
        </div>
        <div style={{ display: "flex", fontSize: 26, fontFamily: "sans-serif", color: "#6b6b6b" }}>
          AI automation · HR analytics · growth marketing
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Gloock", data: gloock, style: "normal", weight: 400 }] },
  );
}
