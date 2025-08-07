import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

export const uploadToS3 = async (data, filename) => {
    try {
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: filename,
            Body: data,
            ContentType: 'application/json'
        };

        // Upload file
        const command = new PutObjectCommand(params);
        await s3Client.send(command);

        // Generate signed URL (valid for 1 hour)
        const getCommand = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: filename
        });
        const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });

        return { Location: signedUrl };
    } catch (err) {
        console.error('S3 upload error:', err);
        throw new Error('Failed to upload to S3');
    }
};
