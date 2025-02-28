var express = require('express');
var router = express.Router();
const Reservation = require('../models/Reservation');
const nodemailer = require('nodemailer');
const { emailConfig } = require('../config/email');

/* GET check time slot availability */
router.get('/check-availability', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, error: '請提供日期參數' });
    }

    // 查詢指定日期的所有預約
    const reservations = await Reservation.find({ date });

    // 提取已預約的時間段
    const reservedTimes = reservations.map(reservation => reservation.selectedTime);

    res.json({
      success: true,
      reservedTimes
    });
  } catch (error) {
    console.error('檢查時間段可用性時發生錯誤:', error);
    res.status(500).json({
      success: false,
      error: '檢查時間段可用性時發生錯誤'
    });
  }
});

/* POST create a new reservation */
router.post('/', async (req, res) => {
  let transporter;
  try {
    // 直接使用前端傳來的日期字符串
    const reservationData = {
      ...req.body
    };
    const reservation = new Reservation(reservationData);
    await reservation.save();

    // 創建郵件傳輸器
    transporter = nodemailer.createTransport(emailConfig);

    // 驗證郵件配置
    await transporter.verify();

    // 使用原始日期字符串
    const formattedDate = reservation.date;
    const services = reservation.selectedItems.join('、');

    // 設置郵件內容
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.NOTIFICATION_EMAILS,
      subject: '兆豐輪胎保養廠 - 客戶預約通知',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #2c3e50; text-align: center; border-bottom: 2px solid #3498db; padding-bottom: 10px;">新預約通知</h2>
          
          <div style="background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 5px;">
            <h3 style="color: #2c3e50; margin-bottom: 15px;">預約詳情</h3>
            <p style="margin: 8px 0;"><strong>姓名：</strong>${reservation.name}</p>
            <p style="margin: 8px 0;"><strong>預約日期：</strong>${formattedDate}</p>
            <p style="margin: 8px 0;"><strong>預約時間：</strong>${reservation.selectedTime}</p>
            <p style="margin: 8px 0;"><strong>車牌號碼：</strong>${reservation.license}</p>
            <p style="margin: 8px 0;"><strong>聯絡電話：</strong>${reservation.phone}</p>
            <p style="margin: 8px 0;"><strong>是否需要到府牽車：</strong>${reservation.needPickup ? '是' : '否'}</p>
          </div>

          <div style="background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 5px;">
            <h3 style="color: #2c3e50; margin-bottom: 15px;">服務項目</h3>
            <p style="margin: 8px 0;">${services}</p>
          </div>

          <div style="text-align: center; margin-top: 20px; padding: 15px; background-color: #e8f4f8; border-radius: 5px;">
            <p style="color: #666; margin: 5px 0;">請儘快確認此預約並與客戶聯繫</p>
            <p style="color: #666; margin: 5px 0;">如有任何問題，請立即處理</p>
          </div>

          <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #888;">
            <p>此為系統自動發送的郵件，請勿直接回覆</p>
            <p>兆豐汽車保養廠 © ${new Date().getFullYear()}</p>
          </div>
        </div>
      `
    };

    // 發送郵件
    const info = await transporter.sendMail(mailOptions);
    console.log('郵件發送成功:', info.messageId);

    res.json({ success: true, reservation, emailSent: true });
  } catch (error) {
    console.error('錯誤:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      res.status(400).json({ success: false, error: errors.join('、') });
    } else if (error.code === 'EAUTH') {
      res.status(500).json({ success: false, error: '郵件認證失敗，請檢查郵件配置' });
    } else {
      res.status(500).json({ success: false, error: '預約成功但郵件發送失敗，請聯繫管理員' });
    }
  } finally {
    if (transporter) {
      transporter.close();
    }
  }
});

module.exports = router;