// api/get-phone.js
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { token } = req.body || {};
  if (!token) return res.status(400).json({ error: "Thiếu token" });

  const APP_ID = process.env.APP_ID;
  const SECRET_KEY = process.env.SECRET_KEY;

  if (!APP_ID || !SECRET_KEY) {
    return res.status(500).json({ error: "Thiếu cấu hình APP_ID hoặc SECRET_KEY" });
  }

  try {
    // ✅ Đúng endpoint cho Mini App (không phải /oa/)
    const tokenRes = await fetch("https://oauth.zaloapp.com/v4/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "secret_key": SECRET_KEY,
      },
      body: new URLSearchParams({
        app_id: APP_ID,
        grant_type: "authorization_code",
        code: token,
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      console.error("Zalo token error:", JSON.stringify(tokenData));
      return res.status(500).json({
        error: "Không lấy được access_token",
        detail: tokenData,
      });
    }

    // Lấy SĐT từ Zalo Graph API
    const phoneRes = await fetch("https://graph.zalo.me/v2.0/me/info", {
      method: "GET",
      headers: {
        "access_token": tokenData.access_token,
        "code": token,
        "secret_key": SECRET_KEY,
      },
    });

    const phoneData = await phoneRes.json();

    if (!phoneData?.data?.number) {
      console.error("Zalo phone error:", JSON.stringify(phoneData));
      return res.status(500).json({
        error: "Không lấy được số điện thoại",
        detail: phoneData,
      });
    }

    // Chuẩn hoá: +84912345678 → 0912345678
    const raw = phoneData.data.number;
    const phoneNumber = raw.startsWith("+84") ? "0" + raw.slice(3) : raw;

    return res.status(200).json({ phoneNumber });

  } catch (err) {
    console.error("Server error:", err.message);
    return res.status(500).json({ error: "Lỗi server: " + err.message });
  }
}
