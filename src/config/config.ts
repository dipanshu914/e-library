import { config as conf } from "dotenv";


conf();

const _config = {
    port: process.env.PORT,
    databaseUrl: process.env.MONGO_CONNECTION_STRING,
    env: process.env.NODE_ENV,
    jwtSecret: process.env.JWT_SECRET,

    // Cloudinary
    cloudinary_api_name: process.env.CLOUDINARY_NAME,
    cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
    cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,

    // frontend domain
    frontend_domain: process.env.FRONTEND_DOMAIN
}


export const config = Object.freeze(_config)
