// api/get-phone.js
export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Thiếu token" });
    }

    // 👉 Mini App: dùng trực tiếp token
    const response = await fetch("https://graph.zalo.me/v2.0/me/info", {
      method: "GET",
      headers: {
        access_token: token,
      },
    });

    const data = await response.json();
    console.log("Zalo response:", JSON.stringify(data));

    const rawPhone = data?.data?.number || "";

    const phoneNumber = rawPhone.startsWith("+84")
      ? "0" + rawPhone.slice(3)
      : rawPhone;

    if (!phoneNumber) {
      return res.status(404).json({
        error: "Không lấy được số điện thoại",
        detail: data,
      });
    }

    return res.json({ phoneNumber });
  } catch (err) {
    console.error("Lỗi get-phone:", err);
    return res.status(500).json({
      error: "Lỗi server nội bộ",
    });
  }
}
