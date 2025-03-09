import multer from "multer";


export const MulterHost = (allowedExtention = []) => {
  const storage = multer.diskStorage({});
    
  const fileFilter = (req, file, cb) => {
    if (allowedExtention.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"), false);
    }
  };
  const upload = multer({ fileFilter, storage });
  return upload;
};
