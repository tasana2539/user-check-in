const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Signin route
async function signinRoute(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'ไม่พบผู้ใช้งานนี้' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'รหัสผ่านไม่ถูกต้อง' });
    // JWT token
    const token = jwt.sign({ id: user._id, userlevel: user.userlevel }, 'secretkey', { expiresIn: '1d' });
    // ส่ง user object กลับไปด้วย (สำหรับเก็บใน localStorage)
    res.json({
      token,
      user: {
      email: user.email,
      name: user.name,
      phone: user.phone,
      userlevel: user.userlevel
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
  }
}

module.exports = signinRoute;
