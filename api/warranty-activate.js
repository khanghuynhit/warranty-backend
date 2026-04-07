// api/warranty-activate.js
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { phone, orderId, userName } = req.body || {};

  if (!orderId?.trim()) return res.status(400).json({ error: "Vui lòng nhập mã đơn hàng." });
  if (!userName?.trim()) return res.status(400).json({ error: "Vui lòng nhập họ và tên." });

  // Giữ nguyên dạng chuỗi, KHÔNG uppercase vì mã TikTok là số
  const normalizedOrderId = orderId.trim();

  const SHEET_ID   = process.env.GOOGLE_SHEET_ID;
  const API_KEY    = process.env.GOOGLE_API_KEY;
  const SHEET_NAME = process.env.SHEET_NAME || "Sheet1";

  if (!SHEET_ID || !API_KEY) {
    return res.status(500).json({ error: "Chưa cấu hình GOOGLE_SHEET_ID hoặc GOOGLE_API_KEY." });
  }

  try {
    // Lấy toàn bộ cột A, dùng FORMATTED_VALUE để số dài không bị làm tròn
    const range = encodeURIComponent(`${SHEET_NAME}!A:A`);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}&valueRenderOption=FORMATTED_VALUE`;

    const sheetRes = await fetch(url);
    const sheetData = await sheetRes.json();

    if (!sheetRes.ok || !sheetData.values) {
      console.error("Google Sheets error:", JSON.stringify(sheetData));
      return res.status(500).json({ error: "Không đọc được dữ liệu từ Google Sheets." });
    }

    // Bỏ dòng 1 (tiêu đề "Mã đơn hàng"), lấy từ dòng 2 trở đi
    const validOrders = sheetData.values
      .slice(1)
      .flat()
      .map(v => v.toString().trim())
      .filter(Boolean);

    if (!validOrders.includes(normalizedOrderId)) {
      return res.status(404).json({
        error: `Mã đơn hàng "${normalizedOrderId}" không tồn tại. Vui lòng kiểm tra lại.`,
      });
    }

    console.log("✅ Kích hoạt bảo hành:", {
      orderId: normalizedOrderId,
      phone: phone?.trim() || "—",
      userName: userName.trim(),
      activatedAt: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      orderId: normalizedOrderId,
      activatedAt: new Date().toISOString(),
    });

  } catch (err) {
    console.error("Server error:", err.message);
    return res.status(500).json({ error: "Lỗi server: " + err.message });
  }
}
