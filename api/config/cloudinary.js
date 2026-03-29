import 'dotenv/config'
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('cloud name:', process.env.CLOUDINARY_CLOUD_NAME)
console.log('api key:', process.env.CLOUDINARY_API_KEY)
console.log('api secret exists:', !!process.env.CLOUDINARY_API_SECRET)
export default cloudinary;