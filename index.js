const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const payOS = require("./utils/payos");

const app = express();
const PORT = process.env.PORT || 3030;
dotenv.config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Định tuyến cho các tài nguyên tĩnh và các route phụ
app.use("/", express.static("public"));
app.use("/payment", require("./controllers/payment-controller"));
app.use("/order", require("./controllers/order-controller"));
app.use(cors());

// Tạo liên kết thanh toán bằng PayOS
app.post("/create-payment-link", async (req, res) => {
  const YOUR_DOMAIN = "http://localhost:3030";

  // Ví dụ payload mẫu (commented out để tham khảo)
  // const body = {
  //     orderCode: Number(String(Date.now()).slice(-6)),
  //     amount: 5000,
  //     description: 'Thanh toan don hang',
  //     returnUrl: `http://localhost:3000/about-us`, // Sửa lỗi thiếu dấu ngoặc kép
  //     cancelUrl: `${YOUR_DOMAIN}/cancel.html` // Sửa lỗi cú pháp với template string
  // };

  try {
    // Gọi PayOS để tạo liên kết thanh toán
    const paymentLinkResponse = await payOS.createPaymentLink(req.body);

    // Log kiểm tra checkoutUrl để xác minh
    console.log("Generated Checkout URL: ", paymentLinkResponse.checkoutUrl);

    // Trả về JSON chứa URL thanh toán thay vì dùng res.redirect
    res.json({ checkoutUrl: paymentLinkResponse.checkoutUrl });
  } catch (error) {
    // Xử lý lỗi và trả về mã trạng thái 500 với thông báo lỗi chi tiết
    console.error("Error while creating payment link: ", error);
    res.status(500).json({ error: error.message });
  }
});

// Khởi chạy server và lắng nghe trên cổng được chỉ định
app.listen(PORT, function () {
  console.log(`Server is listening on port ${PORT}`); // Sửa lỗi thiếu dấu nháy kép
});
