const Item = require('../models/Item');
const Booking = require('../models/Booking');
const express = require('express');
const router = express.Router();

// create item (API route)
router.post('/', async function(req, res) {
    try {
        const { number, category } = req.body;
        if (!number || !category) {
            return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
        }

        // check if item already exists with the same number and category
        const existingItem = await Item.findOne({ number, category });
        if (existingItem) {
            return res.status(400).json({ message: 'ที่นั่งนี้มีอยู่แล้ว' });
        }

        const item = new Item({ number, category });
        await item.save();

        // ส่ง item ID กลับมาด้วย
        res.status(201).json({
            message: 'สร้างที่นั่งสำเร็จ',
            itemId: item.id
        });
    } catch (err) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
    }
});


// GET /item
router.get('/', async function(req, res) {
    try {
        const items = await Item.find()
        .sort({ number: 1 })
        .populate('booking'); // ดึงข้อมูล booking มาด้วย

        res.json(items);
    } catch (err) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
    }
});

// GET /item/:id
router.get('/:id', async function(req, res) {
  try {
    const itemId = req.params.id; // ดึงจาก params
    const item = await Item.findById(itemId)
      .populate('booking'); // ดึงข้อมูล booking มาด้วย

    if (!item) {
      return res.status(404).json({ message: 'ไม่พบที่นั่งที่ระบุ' });
    }

    res.json(item); // ส่งข้อมูลของที่นั่งที่พบ
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
  }
});

// DELETE /item/:id
router.delete('/:id', async (req, res) => {
  try {
    const itemId = req.params.id;

    // ลบการจองที่เกี่ยวข้องก่อน
    await Booking.deleteOne({ item: itemId });

    // ลบที่นั่ง
    const deletedItem = await Item.findByIdAndDelete(itemId);
    if (!deletedItem) {
      return res.status(404).json({ message: 'ไม่พบที่นั่ง' });
    }

    res.json({ message: 'ลบที่นั่งและการจองเรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
  }
});


module.exports = router;