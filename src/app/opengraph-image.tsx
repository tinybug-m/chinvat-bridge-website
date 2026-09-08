import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SITE_TITLE } from "@/lib/constants";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logoData = await readFile(join(process.cwd(), "public/logo.jpg"));
  const logoSrc = `data:image/jpeg;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#080807",
          backgroundImage:
            "linear-gradient(to right, rgba(197,160,89,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(197,160,89,0.08) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          padding: "80px",
        }}
      >
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: "50%",
            overflow: "hidden",
            display: "flex",
            border: "3px solid #c5a059",
            marginBottom: 48,
          }}
        >
          <img src={logoSrc} alt="" width={140} height={140} style={{ objectFit: "cover" }} />
        </div>
        <div
          style={{
            fontSize: 30,
            letterSpacing: 12,
            color: "#f8f4ec",
            fontWeight: 600,
            display: "flex",
          }}
        >
          CHINVAT BRIDGE
        </div>
        <div
          style={{
            fontSize: 26,
            color: "#c5a059",
            marginTop: 28,
            display: "flex",
          }}
        >
          {SITE_TITLE.replace("Chinvat Bridge — ", "")}
        </div>
      </div>
    ),
    { ...size }
  );
}
