const Booking = require('../models/Booking');
const Item = require('../models/Item');
const express = require('express');
const router = express.Router();

// GET /booking/by-item/:itemId
router.get('/by-item/:itemId', async (req, res) => {
  try {
    const booking = await Booking.findOne({ item: req.params.itemId });
    if (!booking) return res.status(404).json({ message: 'ไม่พบการจองของที่นั่งนี้' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
  }
});


// PUT /booking/:id
router.put('/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const { status, user, phone } = req.body;

    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: 'ไม่พบที่นั่ง' });

    const currentBooking = await Booking.findOne({ item: itemId });

    if (status === 'available') {
      // ถ้ามีการจองเดิม ให้ลบ
      if (currentBooking) await currentBooking.deleteOne();
      return res.json({ message: 'ยกเลิกการจองเรียบร้อย' });
    }

    // หากสถานะคือ checked → ตรวจสอบ
    if (!phone || !user) {
      return res.status(400).json({ message: 'ต้องระบุชื่อและเบอร์โทรเมื่อเลือกสถานะเป็น checked' });
    }

    // หา booking อื่นที่ใช้เบอร์นี้ (จองที่อื่นอยู่)
    const existingBooking = await Booking.findOne({
      phone,
      item: { $ne: itemId },
    });

    if (existingBooking) {
      // สลับ booking: เอา item ของกันและกันมาใส่
      const oldItemId = existingBooking.item;
      existingBooking.item = itemId;

      if (currentBooking) {
        currentBooking.item = oldItemId;
        await currentBooking.save();
      } else {
        // ถ้าไม่มี booking เดิม → สร้างใหม่
        await Booking.create({
          item: oldItemId,
          user: existingBooking.user,
          phone: existingBooking.phone,
        });
      }

      await existingBooking.save();
      return res.json({ message: 'สลับที่นั่งเรียบร้อย', swappedWith: oldItemId });
    }

    // ถ้าไม่มี booking ซ้ำ: แค่สร้างใหม่หรืออัปเดต
    if (currentBooking) {
      currentBooking.user = user;
      currentBooking.phone = phone;
      await currentBooking.save();
    } else {
      await Booking.create({
        item: itemId,
        user,
        phone,
        status: 'checked',
      });
    }

    res.json({ message: 'จองที่นั่งเรียบร้อย' });

  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
  }
});

module.exports = router;
