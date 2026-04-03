import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const createCloudinaryUpload = (folder = 'UniMart_Reviews') => {
    const storage = new CloudinaryStorage({
        cloudinary,
        params: {
            folder,
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        },
    });

    return multer({ storage });
};

const upload = createCloudinaryUpload();

export { createCloudinaryUpload };
export default upload;
