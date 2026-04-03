// api/warranty-activate.js
// Endpoint: POST /api/warranty-activate
// Body: { phone, orderId, userId }
// Response: { success: true, activatedAt: "..." }

const OA_ID = process.env.OA_ID || "268606711732023158"; // TERUS TECH OA ID
const OA_ACCESS_TOKEN = process.env.OA_ACCESS_TOKEN; // Lấy từ Zalo OA Manager

async function sendZaloOAMessage(userId, orderId) {
  if (!OA_ACCESS_TOKEN || !userId) return;

  const message = `Chúc mừng! Bảo hành đơn hàng "${orderId}" đã được kích hoạt thành công. TERUS TECH sẽ hỗ trợ bạn trong suốt thời gian bảo hành.\n\nChào mừng bạn đến với kênh Zalo chính thức của TERUS TECH. Với mục tiêu hỗ trợ bạn trong quá trình sử dụng và bảo hành.\n\nHãy bấm QUAN TÂM TERUS TECH ngay nhé !`;

  try {
    const res = await fetch("https://openapi.zalo.me/v3.0/oa/message/cs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: OA_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        recipient: { user_id: userId },
        message: { text: message },
      }),
    });

    const data = await res.json();
    console.log("Zalo OA message response:", JSON.stringify(data));
    return data;
  } catch (err) {
    // Không gửi được tin nhắn → không fail toàn bộ request
    console.error("Lỗi gửi tin nhắn Zalo OA:", err);
  }
}

export default async function handler(req, res) {
  // Cho phép Zalo Mini App gọi API
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Xử lý preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { phone, orderId, userId } = req.body;

  if (!phone || !orderId) {
    return res.status(400).json({ error: "Thiếu phone hoặc orderId" });
  }

  try {
    // ← Thêm logic lưu database của bạn ở đây
    // Ví dụ MongoDB:
    // await WarrantyModel.create({ phone, orderId, userId, activatedAt: new Date() });

    console.log(
      `✅ Kích hoạt bảo hành: ${orderId} - ${phone} - userId: ${userId}`,
    );

    // Gửi tin nhắn tự động qua Zalo OA
    await sendZaloOAMessage(userId, orderId);

    return res.json({
      success: true,
      activatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Lỗi:", err);
    return res.status(500).json({ error: "Lỗi server nội bộ" });
  }
}
