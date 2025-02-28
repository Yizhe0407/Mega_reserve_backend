const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, '請輸入姓名'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, '請輸入電話號碼'],
        trim: true
    },
    license: {
        type: String,
        required: [true, '請輸入車牌號碼'],
        trim: true
    },
    selectedItems: [{
        type: String,
        required: [true, '請選擇至少一個服務項目']
    }],
    date: {
        type: Date,
        required: [true, '請選擇預約日期']
    },
    selectedTime: {
        type: String,
        required: [true, '請選擇預約時間']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Reservation', reservationSchema);