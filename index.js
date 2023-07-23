const AWS = require('aws-sdk');
const sharp = require('sharp');

const s3 = new AWS.S3();

exports.handler = async (event, context) => {
    try {
        const bucket = event.Records[0].s3.bucket.name;
        const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

        // Check if the object key starts with the specified prefix
        if (!key.startsWith('objects/')) {
            console.log('Skipping object:', key);
            return;
        }

        const getObjectParams = {
            Bucket: bucket,
            Key: key,
        };

        const { Body } = await s3.getObject(getObjectParams).promise();

        const resizedImage = await sharp(Body)
            .resize(800, 600)
            .toBuffer();

        const putObjectParams = {
            Bucket: bucket,
            Key: `resized/${key}`,
            Body: resizedImage,
        };

        await s3.putObject(putObjectParams).promise();

        console.log('Image resized successfully.');

        return {
            statusCode: 200,
            body: 'Image resized successfully.',
        };
    } catch (error) {
        console.error('Error:', error);

        return {
            statusCode: 500,
            body: 'An error occurred while resizing the image.',
        };
    }
};
