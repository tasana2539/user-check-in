const User = require('../models/User');

// Signup route
async function signupRoute(req, res) {
  try {
    const { email, password, name, phone, userlevel } = req.body;
    if (!email || !password || !name || !phone || !userlevel) {
      return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }
    // Check duplicate email
    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ message: 'อีเมลนี้ถูกใช้แล้ว' });
    const user = new User({ email, password, name, phone, userlevel });
    await user.save();
    res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ' });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
  }
}

module.exports = signupRoute;
