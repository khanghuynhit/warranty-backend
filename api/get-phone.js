export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
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
    // ✅ STEP 1: đổi token → access_token
    const tokenRes = await fetch(
      "https://oauth.zaloapp.com/v4/miniapp/access_token",
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

    const tokenData = await tokenRes.json();
    console.log("TokenData:", JSON.stringify(tokenData));

    if (!tokenData.access_token) {
      return res.status(500).json({
        error: "Không lấy được access_token",
        detail: tokenData,
      });
    }

    // ✅ STEP 2: lấy số điện thoại
    const phoneRes = await fetch(
      "https://graph.zalo.me/v2.0/me/info?fields=phone",
      {
        method: "GET",
        headers: {
          access_token: tokenData.access_token,
        },
      },
    );

    const phoneData = await phoneRes.json();
    console.log("PhoneData:", JSON.stringify(phoneData));

    const rawPhone = phoneData?.data?.number || "";

    const phoneNumber = rawPhone.startsWith("+84")
      ? "0" + rawPhone.slice(3)
      : rawPhone;

    if (!phoneNumber) {
      return res.status(404).json({
        error: "Không lấy được số điện thoại",
        detail: phoneData,
      });
    }

    return res.json({ phoneNumber });
  } catch (err) {
    console.error("Lỗi get-phone:", err);
    return res.status(500).json({ error: "Lỗi server nội bộ" });
  }
}
