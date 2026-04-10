export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
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
        access_token: accessToken, // từ sdk.getAccessToken() ở client
        code: token, // từ getPhoneNumber() ở client
        secret_key: SECRET_KEY, // secret key của Zalo App
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
