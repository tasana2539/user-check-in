const User = require('../../models/User');
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
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'ข้อมูลไม่ถูกต้อง' });
    }
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
