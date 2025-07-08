const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

 try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error("JWT verification error:", err);
    res.status(401).json({ message: "Token is not valid" });
  }
};
// பாதுகாக்கப்பட்ட API
app.get('/protected', verifyToken, (req, res) => {
  res.json({ message: 'பாதுகாக்கப்பட்ட தரவு', user: req.user });
});

app.listen(5000, () => console.log('Server running on port 5000'));
module.exports = authMiddleware;
