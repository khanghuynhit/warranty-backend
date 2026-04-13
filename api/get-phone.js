export default async function handler(req, res) {
  // Xử lý CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Trả về 200 cho preflight OPTIONS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // DEMO MODE
  if (process.env.DEMO_MODE === "true") {
    return res.json({ phoneNumber: "0900000000" });
  }

  const { token, accessToken } = req.body;

  if (!token || !accessToken) {
    return res.status(400).json({ error: "Thiếu token hoặc accessToken" });
  }

  const SECRET_KEY = process.env.SECRET_KEY;

  try {
    const phoneRes = await fetch("https://graph.zalo.me/v2.0/me/info", {
      method: "GET",
      headers: {
        access_token: accessToken,
        code: token,
        secret_key: SECRET_KEY,
      },
    });

    const phoneData = await phoneRes.json();

    if (phoneData.error !== 0) {
      console.error("Zalo API error:", phoneData);
      return res
        .status(500)
        .json({ error: phoneData.message || "Zalo trả lỗi" });
    }

    const rawPhone = phoneData?.data?.number || "";
    const phoneNumber = rawPhone.startsWith("84")
      ? "0" + rawPhone.slice(2)
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
