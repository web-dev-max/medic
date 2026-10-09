import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 5;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${crypto.randomBytes(8).toString('hex')}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    (callback as (err: any, accept: boolean) => void)(new Error('Допустимы только PNG и JPG файлы'), false);
    return;
  }
  callback(null, true);
};

const limits = {
  fileSize: MAX_FILE_SIZE,
  files: MAX_FILES,
};

export const upload = multer({ storage, fileFilter, limits });

@Injectable()
export class FileUploadMiddleware implements NestMiddleware {
  private readonly logger = new Logger(FileUploadMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    // Only apply to service requests that may have file uploads
    if (req.path === '/api/requests/service' && req.method === 'POST') {
      const multerMiddleware = upload.fields([
        { name: 'photos', maxCount: MAX_FILES },
      ]);

      multerMiddleware(req, res, (err: any) => {
        if (err) {
          this.logger.error(`File upload error: ${err.message}`);
          // Multer errors will be handled by NestJS validation pipe
          next(err);
          return;
        }
        next();
      });
    } else {
      next();
    }
  }
}
