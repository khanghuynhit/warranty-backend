// api/warranty-activate.js
// Endpoint: POST /api/warranty-activate
// Body: { phone, orderId }
// Response: { success: true, activatedAt: "..." }

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

  const { phone, orderId } = req.body;

  if (!phone || !orderId) {
    return res.status(400).json({ error: "Thiếu phone hoặc orderId" });
  }

  try {
    // ← Thêm logic lưu database của bạn ở đây
    // Ví dụ MongoDB:
    // await WarrantyModel.create({ phone, orderId, activatedAt: new Date() });

    console.log(`✅ Kích hoạt bảo hành: ${orderId} - ${phone}`);

    return res.json({
      success: true,
      activatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Lỗi:", err);
    return res.status(500).json({ error: "Lỗi server nội bộ" });
  }
}
