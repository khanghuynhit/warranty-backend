// api/get-phone.js
// Token từ getPhoneNumber() của Mini App SDK là access_token của user
// KHÔNG cần đổi qua bước lấy access_token nữa — dùng thẳng

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

  try {
    // token từ getPhoneNumber() là access_token của user — dùng thẳng
    const phoneRes = await fetch("https://graph.zalo.me/v2.0/me/info", {
      method: "GET",
      headers: {
        access_token: token,
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
      // Fallback: thử endpoint khác nếu graph.zalo.me không trả SĐT
      const phoneRes2 = await fetch(
        `https://openapi.zalo.me/v2.0/me?fields=id,name,phone`,
        {
          headers: {
            access_token: token,
          },
        },
      );
      const phoneData2 = await phoneRes2.json();
      console.log("Phone data (fallback):", JSON.stringify(phoneData2));

      const rawPhone2 = phoneData2?.phone || "";
      const phoneNumber2 = rawPhone2.startsWith("+84")
        ? "0" + rawPhone2.slice(3)
        : rawPhone2;

      if (!phoneNumber2) {
        return res.status(404).json({
          error: "Không tìm thấy số điện thoại",
          debug: { phoneData, phoneData2 },
        });
      }

      return res.json({ phoneNumber: phoneNumber2 });
    }

    return res.json({ phoneNumber });
  } catch (err) {
    console.error("Lỗi get-phone:", err);
    return res.status(500).json({ error: "Lỗi server nội bộ" });
  }
}
