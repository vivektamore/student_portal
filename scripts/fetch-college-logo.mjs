import fs from "node:fs";

async function fetchLogo() {
  try {
    const res = await fetch("https://www.mdshahmahilacollege.ac.in/userpanel/default.aspx");
    const html = await res.text();
    const regex = /src=["']([^"']+\.(png|jpg|jpeg|gif|svg))["']/gi;
    let match;
    const urls = [];
    while ((match = regex.exec(html)) !== null) {
      urls.push(match[1]);
    }
    console.log("Images found on website:", urls);

    // Find logo
    const logoUrl = urls.find(u => u.toLowerCase().includes("logo")) || urls[0];
    console.log("Best logo URL candidate:", logoUrl);

    if (logoUrl) {
      const fullUrl = logoUrl.startsWith("http")
        ? logoUrl
        : new URL(logoUrl, "https://www.mdshahmahilacollege.ac.in/").href;
      console.log("Downloading from:", fullUrl);
      const imgRes = await fetch(fullUrl);
      if (imgRes.ok) {
        const buffer = Buffer.from(await imgRes.arrayBuffer());
        fs.writeFileSync("./public/college-logo.png", buffer);
        console.log("Successfully saved ./public/college-logo.png! Size:", buffer.length);
      }
    }
  } catch (err) {
    console.error("Fetch logo error:", err);
  }
}

fetchLogo();
