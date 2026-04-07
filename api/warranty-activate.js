// api/warranty-activate.js
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { phone, orderId, userName } = req.body;

  if (!orderId)
    return res.status(400).json({ error: "Vui lòng nhập mã đơn hàng." });
  if (!phone)
    return res.status(400).json({ error: "Vui lòng nhập số điện thoại." });

  try {
    // ================================================================
    // BƯỚC 1: Kiểm tra mã đơn hàng từ Google Sheets
    // ================================================================
    const SHEET_ID = process.env.SHEET_ID;
    const SHEET_API_KEY = process.env.SHEET_API_KEY;
    const SHEET_NAME = process.env.SHEET_NAME || "Sheet1";

    let orderExists = false;

    if (SHEET_ID && SHEET_API_KEY) {
      try {
        const sheetRes = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${SHEET_API_KEY}`,
        );
        const sheetData = await sheetRes.json();
        const rows = sheetData.values || [];

        // Tìm orderId trong cột đầu tiên (cột A)
        // Bỏ qua hàng đầu tiên nếu là header
        orderExists = rows.some((row) => {
          const cellValue = (row[0] || "").toString().trim().toUpperCase();
          return cellValue === orderId.toUpperCase();
        });
      } catch (sheetErr) {
        console.error("Lỗi đọc Google Sheets:", sheetErr);
        return res
          .status(500)
          .json({ error: "Không đọc được dữ liệu từ Google Sheets." });
      }
    } else {
      // Fallback test nếu chưa cấu hình Sheets
      const VALID_ORDERS = ["DH001", "DH002", "DH003", "TEST001"];
      orderExists = VALID_ORDERS.includes(orderId.toUpperCase());
    }

    if (!orderExists) {
      return res.status(404).json({
        error: "Mã đơn hàng không hợp lệ. Vui lòng kiểm tra lại.",
      });
    }

    // ================================================================
    // BƯỚC 2: Lưu thông tin kích hoạt (thêm vào Google Sheets hoặc DB)
    // ================================================================
    console.log(`✅ Kích hoạt bảo hành: ${orderId} - ${userName} - ${phone}`);

    return res.json({
      success: true,
      activatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Lỗi:", err);
    return res
      .status(500)
      .json({ error: "Lỗi server nội bộ. Vui lòng thử lại." });
  }
}
