/*
 * S3 STUB - FOR BEGINNERS
 * 
 * Currently, this project saves files to the local /uploads folder.
 * In a real production app, you would use AWS S3 or similar.
 * 
 * To switch to S3 later:
 * 1. npm install aws-sdk multer-s3
 * 2. Configure AWS credentials in .env
 * 3. Replace the 'multer' storage configuration in routes/claims.js with:
 * 
 * const s3 = new aws.S3({ ... });
 * const storage = multerS3({
 *    s3: s3,
 *    bucket: 'my-bucket-name',
 *    key: function (req, file, cb) {
 *        cb(null, Date.now().toString())
 *    }
 * });
 * 
 * This file is just a placeholder to show where that logic would live.
 */
module.exports = {};
