// api/get-phone.js
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  // Log toàn bộ body nhận được để xem đang truyền field gì
  console.log("Request body:", JSON.stringify(req.body));

  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Thiếu token" });

  const SECRET_KEY = process.env.SECRET_KEY;
  const APP_ID = process.env.APP_ID;

  console.log("Token nhận được:", token);
  console.log("Token length:", token.length);
  console.log("APP_ID:", APP_ID ? "có" : "thiếu");
  console.log("SECRET_KEY:", SECRET_KEY ? "có" : "thiếu");

  try {
    // Thử cách 1: dùng token trực tiếp làm access_token
    const phoneRes = await fetch("https://graph.zalo.me/v2.0/me/info", {
      method: "GET",
      headers: {
        access_token: token,
        secret_key: SECRET_KEY,
      },
    });
    const phoneData = await phoneRes.json();
    console.log("Cách 1 - graph.zalo.me:", JSON.stringify(phoneData));

    if (phoneData?.data?.number) {
      const rawPhone = phoneData.data.number;
      const phoneNumber = rawPhone.startsWith("+84")
        ? "0" + rawPhone.slice(3)
        : rawPhone;
      return res.json({ phoneNumber });
    }

    // Thử cách 2: đổi token lấy access_token qua Mini App endpoint
    const tokenRes = await fetch("https://oauth.zaloapp.com/v4/access_token", {
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
    const tokenData = await tokenRes.json();
    console.log("Cách 2 - access_token:", JSON.stringify(tokenData));

    if (tokenData.access_token) {
      const phoneRes2 = await fetch("https://graph.zalo.me/v2.0/me/info", {
        method: "GET",
        headers: {
          access_token: tokenData.access_token,
          secret_key: SECRET_KEY,
        },
      });
      const phoneData2 = await phoneRes2.json();
      console.log("Cách 2 - phone:", JSON.stringify(phoneData2));

      if (phoneData2?.data?.number) {
        const rawPhone = phoneData2.data.number;
        const phoneNumber = rawPhone.startsWith("+84")
          ? "0" + rawPhone.slice(3)
          : rawPhone;
        return res.json({ phoneNumber });
      }
    }

    return res.status(404).json({
      error: "Không lấy được số điện thoại",
      debug: { phoneData, tokenData: tokenData || null },
    });
  } catch (err) {
    console.error("Lỗi:", err);
    return res.status(500).json({ error: "Lỗi server nội bộ" });
  }
}
