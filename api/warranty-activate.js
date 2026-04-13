import { google } from "googleapis";

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
  if (!userName)
    return res.status(400).json({ error: "Vui lòng nhập họ và tên." });

  // DEMO MODE
  if (process.env.DEMO_MODE === "true") {
    return res.json({
      success: true,
      activatedAt: new Date().toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
      }),
    });
  }

  const SHEET_ID = process.env.GOOGLE_SHEET_ID;
  const SHEET_NAME = process.env.SHEET_NAME || "Sheet1";

  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // BƯỚC 1: Kiểm tra mã đơn hàng trong Sheet1 cột A
    const readRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:A`,
    });

    const rows = readRes.data.values || [];
    const orderExists = rows.some(
      (row) =>
        (row[0] || "").toString().trim().toUpperCase() ===
        orderId.toUpperCase(),
    );

    if (!orderExists) {
      return res
        .status(404)
        .json({ error: "Mã đơn hàng không hợp lệ. Vui lòng kiểm tra lại." });
    }

    // BƯỚC 2: Ghi thông tin kích hoạt vào sheet "BaoHanh"
    const activatedAt = new Date().toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `BaoHanh!A:D`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[orderId, userName, phone, activatedAt]],
      },
    });

    return res.json({ success: true, activatedAt });
  } catch (err) {
    console.error("Lỗi:", err);
    return res
      .status(500)
      .json({ error: "Lỗi server nội bộ. Vui lòng thử lại." });
  }
}
