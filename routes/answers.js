const router = require('express').Router();
const { initializeApp, cert } = require('firebase-admin/app');
const { getStorage, getDownloadURL } = require('firebase-admin/storage');
const {client} = require('../db');

const db = client.db('prepWork');
const collection = db.collection('Answers');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.BUCKET_URL,
});

const bucket = getStorage().bucket();

router.post('/upload', async (req, res) => {
    const { courseNumber, wwNumber, qNumber, qString, file } = req.body;
    let answers = req.body.answers;

    const question = await collection.findOne({qString});

    if (question && question.answers.some(arr => arr.length === answers.length && arr.every((value, index) => value === answers[index]))) {
        return res.json({
            status: false,
            error: 'Question already exists',
        });
    }

    answers = [answers];

    const fileName = `${Date.now()}-${courseNumber}-${wwNumber}-${qNumber}`;

    const base64Image = file.replace(/^data:image\/\w+;base64,/, '');

    const imageBuffer = Buffer.from(base64Image, 'base64');

    // Upload the buffer to Firebase Storage
    const fileRef = bucket.file(fileName);
    const blobStream = fileRef.createWriteStream({
            metadata: {
            contentType: 'image/png', // Set the appropriate content type based on your image format
        },
    });

    blobStream.on('error', (error) => {
        console.error('Error uploading image:', error);
    });

    blobStream.on('finish', async () => {
        // Generate a public URL for the file.
        const publicUrl = await getDownloadURL(fileRef);

        const result = await collection.insertOne({
            courseNumber,
            wwNumber,
            qNumber,
            qString,
            answers,
            file: publicUrl,
        });

        if (result.insertedCount === 0) {
            res.json({
                status: false,
                error: 'Error creating answer',
            });
        }

        res.json({
            status: 'success',
            data: {
                url: publicUrl,
            },
        });
    });

    blobStream.end(imageBuffer);
});

module.exports = router;