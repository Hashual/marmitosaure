import type {Request, Response} from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

export async function UploadMiddleware(req: Request, res: Response, next: Function) {
    const storage = multer.diskStorage({
        destination: (_, __, callback) => {
            fs.mkdirSync(uploadsDir, { recursive: true });
            callback(null, uploadsDir);
        },
        filename: (_, file, callback) => {
            const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 322332);
            callback(null, uniquePrefix + '-' + file.originalname);
        }
    });

    const upload = multer({
        storage: storage,
        limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
        fileFilter: (_, file, callback) => {
            const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (allowedMimeTypes.includes(file.mimetype)) {
                callback(null, true);
            } else {
                callback(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
            }
        }
    })
}