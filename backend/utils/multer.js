import multer from 'multer';

// Shared multer configuration for file uploads
const storage = multer.memoryStorage();

const allowedMimeTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

const fileFilter = (req, file, cb) => {
  if (
    allowedMimeTypes.includes(file.mimetype) ||
    file.originalname.endsWith('.pdf') ||
    file.originalname.endsWith('.docx') ||
    file.originalname.endsWith('.txt')
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter
});

export const uploadSingleFile = (fieldName = 'file') => upload.single(fieldName);

export default upload;


