const PayOS = require("@payos/node");
require('dotenv').config();

// Khởi tạo đối tượng PayOS với các thông tin xác thực từ .env
const payos = new PayOS(process.env.PAYOS_CLIENT_ID, process.env.PAYOS_API_KEY, process.env.PAYOS_CHECKSUM_KEY);

// Hàm tạo liên kết thanh toán với kiểm tra và xử lý lỗi chi tiết hơn
const createPaymentLink = async (payload) => {
  try {
    // Kiểm tra payload trước khi gửi yêu cầu
    if (!payload || typeof payload !== "object") {
      throw new Error("Invalid payload. Must be an object with required fields.");
    }

    const { orderCode, amount, description, returnUrl, cancelUrl, customerName, customerPhone, customerAddress } = payload;

    // Kiểm tra các trường cần thiết trong payload
    if (!orderCode || !Number.isInteger(orderCode)) {
      throw new Error("Invalid Parameter: orderCode must be a non-null integer.");
    }
    if (!amount || typeof amount !== "number" || amount <= 0) {
      throw new Error("Invalid Parameter: amount must be a non-null positive number.");
    }
    if (!description || description.trim() === "") {
      throw new Error("Invalid Parameter: description must be a non-empty string.");
    }
    if (!returnUrl || !/^https?:\/\//.test(returnUrl)) {
      throw new Error("Invalid Parameter: returnUrl must be a valid URL.");
    }
    if (!cancelUrl || !/^https?:\/\//.test(cancelUrl)) {
      throw new Error("Invalid Parameter: cancelUrl must be a valid URL.");
    }
    if (!customerName || customerName.trim() === "") {
      throw new Error("Invalid Parameter: customerName must be a non-empty string.");
    }
    if (!customerPhone || !/^[0-9]+$/.test(customerPhone)) {
      throw new Error("Invalid Parameter: customerPhone must be a valid phone number.");
    }
    if (!customerAddress || customerAddress.trim() === "") {
      throw new Error("Invalid Parameter: customerAddress must be a non-empty string.");
    }

    // Gọi API để tạo liên kết thanh toán
    console.log("Sending request to PayOS with payload: ", payload);
    const paymentLinkResponse = await payos.createPaymentLink(payload);

    // Log phản hồi từ PayOS
    console.log("Response from PayOS: ", paymentLinkResponse);

    // Kiểm tra phản hồi từ PayOS và trả về kết quả
    if (paymentLinkResponse && paymentLinkResponse.checkoutUrl) {
      return { checkoutUrl: paymentLinkResponse.checkoutUrl };
    } else {
      console.error("Invalid response received from PayOS: ", paymentLinkResponse);
      throw new Error("Failed to generate checkout URL.");
    }
  } catch (error) {
    console.error("Error creating payment link: ", error.message);
    return { error: `Failed to create payment link: ${error.message}` };
  }
};

// Xuất hàm để sử dụng trong các API khác
module.exports = { createPaymentLink };
