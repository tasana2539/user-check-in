const Booking = require('../models/Booking');
const Item = require('../models/Item');
const express = require('express');
const router = express.Router();

// PUT /booking/:id
router.put('/booking/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const { user, phone } = req.body;

    if (!phone || !user) {
      return res.status(400).json({ message: 'ต้องระบุชื่อและเบอร์โทร' });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'ไม่พบที่นั่ง' });
    }

    if (item.status === 'checked') {
      return res.status(400).json({ message: 'ที่นั่งนี้ถูกจองไปแล้ว' });
    }

    const existingBooking = await Booking.findOne({
      phone,
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'เบอร์นี้ได้จองที่นั่งไว้แล้ว' });
    }

    // สร้างการจองใหม่
    await Booking.create({
      item: itemId,
      user,
      phone,
      status: 'checked',
    });

    // อัปเดตสถานะของที่นั่ง
    item.status = 'checked';
    await item.save();

    res.json({ message: 'จองที่นั่งเรียบร้อย' });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
  }
});

module.exports = router;
