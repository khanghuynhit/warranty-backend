export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Thiếu token" });

  const APP_ID = process.env.APP_ID;
  const SECRET_KEY = process.env.SECRET_KEY;

  try {
    const oaTokenRes = await fetch(
      "https://oauth.zaloapp.com/v4/access_token",
      {
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
      },
    );

    const oaToken = await oaTokenRes.json();
    console.log("Token response:", JSON.stringify(oaToken));

    if (!oaToken.access_token) {
      return res.status(500).json({
        error: "Không lấy được access_token",
        detail: oaToken,
      });
    }

    const phoneRes = await fetch("https://graph.zalo.me/v2.0/me/info", {
      method: "GET",
      headers: {
        access_token: oaToken.access_token,
        code: token,
        secret_key: SECRET_KEY,
      },
    });

    const phoneData = await phoneRes.json();
    console.log("Phone data:", JSON.stringify(phoneData));

    const rawPhone = phoneData?.data?.number || "";
    const phoneNumber = rawPhone.startsWith("+84")
      ? "0" + rawPhone.slice(3)
      : rawPhone;

    if (!phoneNumber) {
      return res.status(404).json({ error: "Không tìm thấy số điện thoại" });
    }

    return res.json({ phoneNumber });
  } catch (err) {
    console.error("Lỗi get-phone:", err);
    return res.status(500).json({ error: "Lỗi server nội bộ" });
  }
}
