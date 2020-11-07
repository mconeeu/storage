const multer = require('multer');
export default multer.diskStorage({
    destination: function (req: any, file: any, cb: any) {
        cb(null, 'uploads')
    },
    filename: function (req: any, file: any, cb: any) {
        cb(null, file.originalname)
    }
});
