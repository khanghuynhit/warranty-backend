// backend/api/webhook.js
export default async function handler(req, res) {
  // Zalo gửi GET để verify webhook
  if (req.method === "GET") {
    return res.status(200).json({
      status: "ok",
      message: "Webhook TERUS TECH đang hoạt động",
    });
  }

  // Zalo gửi POST khi có event
  if (req.method === "POST") {
    const event = req.body;
    console.log("Zalo OA Event:", JSON.stringify(event));

    // Xử lý event ở đây (sẽ thêm sau)
    return res.status(200).json({ status: "received" });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end();
}
