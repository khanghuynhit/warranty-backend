export default async function handler(req, res) {
  // Handle CORS preflight
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { phone, orderId, userName } = req.body;

  if (!orderId || !orderId.trim()) {
    return res.status(400).json({ error: "Vui lòng nhập mã đơn hàng." });
  }

  if (!userName || !userName.trim()) {
    return res.status(400).json({ error: "Vui lòng nhập họ và tên." });
  }

  // Lưu dữ liệu vào database (MongoDB, Google Sheets, v.v.)
  // Hiện tại: log ra console, bạn thay bằng DB thật sau
  console.log("✅ Kích hoạt bảo hành:", {
    orderId: orderId.trim().toUpperCase(),
    userName: userName.trim(),
    phone: phone?.trim() || "—",
    activatedAt: new Date().toISOString(),
  });

  // TODO: Kết nối MongoDB
  // const { MongoClient } = require("mongodb");
  // const client = new MongoClient(process.env.MONGODB_URI);
  // await client.connect();
  // const db = client.db("warranty");
  // await db.collection("activations").insertOne({
  //   orderId: orderId.trim().toUpperCase(),
  //   userName: userName.trim(),
  //   phone: phone?.trim() || "",
  //   activatedAt: new Date(),
  // });
  // await client.close();

  return res.status(200).json({
    success: true,
    message: "Kích hoạt bảo hành thành công.",
    data: {
      orderId: orderId.trim().toUpperCase(),
      userName: userName.trim(),
      phone: phone?.trim() || "",
      activatedAt: new Date().toISOString(),
    },
  });
}
