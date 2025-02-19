var express = require('express');
var router = express.Router();
const Reservation = require('../models/Reservation');
// const nodemailer = require('nodemailer');
// const { emailConfig, notificationEmail } = require('../config/email');

/* GET check time slot availability */
router.get('/check-availability', async (req, res) => {
  try {
    const { date } = req.query;
    const reservations = await Reservation.find({
      date: {
        $gte: new Date(date).setHours(0, 0, 0),
        $lt: new Date(date).setHours(23, 59, 59)
      }
    }).select('selectedTime');

    const reservedTimes = reservations.map(r => r.selectedTime);
    res.json({ success: true, reservedTimes });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      res.status(400).json({ success: false, error: errors.join('、') });
    } else {
      res.status(400).json({ success: false, error: error.message });
  }
  }
});

/* POST create a new reservation */
router.post('/', async (req, res) => {
  try {
    const reservation = new Reservation(req.body);
    await reservation.save();

    // // 創建郵件傳輸器
    // const transporter = nodemailer.createTransport(emailConfig);

    // // 格式化日期和時間
    // const formattedDate = new Date(reservation.date).toLocaleDateString('zh-TW');
    // const services = reservation.selectedItems.join('、');

    // // 設置郵件內容
    // const mailOptions = {
    //   from: emailConfig.auth.user,
    //   to: notificationEmail,
    //   subject: '新預約通知',
    //   html: `
    //     <h2>新預約通知</h2>
    //     <p>預約日期：${formattedDate}</p>
    //     <p>預約時間：${reservation.selectedTime}</p>
    //     <p>車牌號碼：${reservation.license}</p>
    //     <p>聯絡電話：${reservation.phone}</p>
    //     <p>服務項目：${services}</p>
    //   `
    // };

    // // 發送郵件
    // await transporter.sendMail(mailOptions);

    res.json({ success: true, reservation });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      res.status(400).json({ success: false, error: errors.join('、') });
    } else {
      res.status(400).json({ success: false, error: error.message });
  }
  }
});

module.exports = router;