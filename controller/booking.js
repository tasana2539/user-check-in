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
      // ลบ booking ที่เกี่ยวข้องกับที่นั่งนี้ ถ้ามี
      if (currentBooking) {
        await currentBooking.deleteOne();
      }

      // อัปเดตสถานะของที่นั่งเป็น available
      item.status = 'available';
      await item.save();

      return res.json({ message: 'ยกเลิกการจองและอัปเดตสถานะที่นั่งเรียบร้อย' });
    }

    // ตรวจสอบความถูกต้อง
    if (!phone || !user) {
      return res.status(400).json({ message: 'ต้องระบุชื่อและเบอร์โทรเมื่อเลือกสถานะเป็น checked' });
    }

    // หา booking อื่นที่ใช้เบอร์นี้อยู่ (ห้ามซ้ำ)
    const existingBooking = await Booking.findOne({
      phone,
      item: { $ne: itemId },
    });

    if (existingBooking) {
      // สลับที่นั่ง
      const oldItemId = existingBooking.item;
      existingBooking.item = itemId;

      if (currentBooking) {
        currentBooking.item = oldItemId;
        await currentBooking.save();
      } else {
        await Booking.create({
          item: oldItemId,
          user: existingBooking.user,
          phone: existingBooking.phone,
        });
      }

      await existingBooking.save();

      // อัปเดตสถานะของที่นั่งทั้งสอง
      const oldItem = await Item.findById(oldItemId);
      if (oldItem) {
        oldItem.status = 'checked';
        await oldItem.save();
      }
      item.status = 'checked';
      await item.save();

      return res.json({ message: 'สลับที่นั่งเรียบร้อย', swappedWith: oldItemId });
    }

    // ไม่มี booking ซ้ำ: อัปเดตหรือสร้างใหม่
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

    // อัปเดตสถานะที่นั่ง
    item.status = 'checked';
    await item.save();

    res.json({ message: 'จองที่นั่งเรียบร้อย' });

  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
  }
});


module.exports = router;
