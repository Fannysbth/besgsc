const multer = require('multer');

// simpan sementara di memory (biar langsung upload ke Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;
