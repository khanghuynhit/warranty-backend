// api/get-phone.js
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Thiếu token" });

  const SECRET_KEY = process.env.SECRET_KEY;
  const APP_ID = process.env.APP_ID;

  const results = {};

  try {
    // Thử 1: graph.zalo.me với access_token + secret_key
    const r1 = await fetch("https://graph.zalo.me/v2.0/me/info", {
      method: "GET",
      headers: { access_token: token, secret_key: SECRET_KEY },
    });
    results.try1 = await r1.json();
    console.log("Try1:", JSON.stringify(results.try1));

    if (results.try1?.data?.number) {
      const n = results.try1.data.number;
      return res.json({
        phoneNumber: n.startsWith("+84") ? "0" + n.slice(3) : n,
      });
    }

    // Thử 2: graph.zalo.me chỉ với access_token, không có secret_key
    const r2 = await fetch("https://graph.zalo.me/v2.0/me/info", {
      method: "GET",
      headers: { access_token: token },
    });
    results.try2 = await r2.json();
    console.log("Try2:", JSON.stringify(results.try2));

    if (results.try2?.data?.number) {
      const n = results.try2.data.number;
      return res.json({
        phoneNumber: n.startsWith("+84") ? "0" + n.slice(3) : n,
      });
    }

    // Thử 3: openapi.zalo.me
    const r3 = await fetch(
      "https://openapi.zalo.me/v2.0/me?fields=id,name,phone",
      {
        method: "GET",
        headers: { access_token: token },
      },
    );
    results.try3 = await r3.json();
    console.log("Try3:", JSON.stringify(results.try3));

    if (results.try3?.phone) {
      const n = results.try3.phone;
      return res.json({
        phoneNumber: n.startsWith("+84") ? "0" + n.slice(3) : n,
      });
    }

    // Thử 4: miniapp API riêng
    const r4 = await fetch(
      `https://graph.zalo.me/v2.0/me?fields=id,name,phone&access_token=${token}`,
      { method: "GET" },
    );
    results.try4 = await r4.json();
    console.log("Try4:", JSON.stringify(results.try4));

    if (results.try4?.phone) {
      const n = results.try4.phone;
      return res.json({
        phoneNumber: n.startsWith("+84") ? "0" + n.slice(3) : n,
      });
    }

    // Không tìm được
    console.log("Tất cả cách đều thất bại:", JSON.stringify(results));
    return res.status(404).json({
      error: "Không lấy được số điện thoại",
      debug: results,
    });
  } catch (err) {
    console.error("Lỗi:", err);
    return res.status(500).json({ error: "Lỗi server nội bộ" });
  }
}
