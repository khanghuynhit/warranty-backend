// api/get-phone.js
// Endpoint: POST /api/get-phone
// Body: { token: "..." }
// Response: { phoneNumber: "0912345678" }

export default async function handler(req, res) {
  // Chỉ cho phép POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Thiếu token" });
  }

  const APP_ID = process.env.APP_ID;
  const SECRET_KEY = process.env.SECRET_KEY;

  try {
    // Bước 1: Đổi token lấy access_token
    const oaTokenRes = await fetch("https://oauth.zaloapp.com/v4/oa/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        secret_key: SECRET_KEY,
      },
      body: new URLSearchParams({
        app_id: APP_ID,
        grant_type: "authorization_code",
        code: token,
      }),
    });

    const oaToken = await oaTokenRes.json();

    if (!oaToken.access_token) {
      return res.status(500).json({ error: "Không lấy được access_token từ Zalo" });
    }

    // Bước 2: Dùng access_token lấy số điện thoại
    const phoneRes = await fetch("https://graph.zalo.me/v2.0/me/info", {
      method: "GET",
      headers: {
        access_token: oaToken.access_token,
        code: token,
        secret_key: SECRET_KEY,
      },
    });

    const phoneData = await phoneRes.json();

    // Chuẩn hoá "+84912345678" → "0912345678"
    const rawPhone = phoneData?.data?.number || "";
    const phoneNumber = rawPhone.startsWith("+84")
      ? "0" + rawPhone.slice(3)
      : rawPhone;

    if (!phoneNumber) {
      return res.status(404).json({ error: "Không tìm thấy số điện thoại" });
    }

    return res.json({ phoneNumber });
  } catch (err) {
    console.error("Lỗi:", err);
    return res.status(500).json({ error: "Lỗi server nội bộ" });
  }
}
