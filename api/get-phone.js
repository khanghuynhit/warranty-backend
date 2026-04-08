// api/get-phone.js
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { access_token } = req.body;

  if (!access_token) {
    return res.status(400).json({ error: "Thiếu access_token" });
  }

  try {
    // ✅ GỌI API ĐÚNG (Zalo Login)
    const userRes = await fetch(
      "https://graph.zalo.me/v2.0/me?fields=id,name,picture,phone",
      {
        method: "GET",
        headers: {
          access_token: access_token,
        },
      },
    );

    const userData = await userRes.json();
    console.log("Zalo userData:", JSON.stringify(userData));

    if (userData.error) {
      return res.status(400).json({
        error: "Zalo API error",
        detail: userData,
      });
    }

    const rawPhone = userData?.phone || "";

    // chuẩn hoá số VN
    const phoneNumber = rawPhone.startsWith("+84")
      ? "0" + rawPhone.slice(3)
      : rawPhone;

    return res.json({
      name: userData.name || null,
      id: userData.id || null,
      avatar: userData.picture?.data?.url || null,
      phoneNumber: phoneNumber || null,
    });
  } catch (err) {
    console.error("Lỗi get-phone:", err);
    return res.status(500).json({ error: "Lỗi server nội bộ" });
  }
}
