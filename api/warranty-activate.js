// api/warranty-activate.js
// Endpoint: POST /api/warranty-activate
// Body: { phone, orderId }
// Response: { success: true, activatedAt: "..." }

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { phone, orderId } = req.body;

  if (!phone || !orderId) {
    return res.status(400).json({ error: "Thiếu phone hoặc orderId" });
  }

  try {
    // ← Thêm logic lưu database của bạn ở đây
    // Ví dụ: await db.insert({ phone, orderId, activatedAt: new Date() });

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
