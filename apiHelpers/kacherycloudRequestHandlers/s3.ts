import AWS from 'aws-sdk';

const s3 = new AWS.S3({
    apiVersion: "2006-03-01",
    accessKeyId: process.env['FILEBASE_ACCESS_KEY'],
    secretAccessKey: process.env['FILEBASE_SECRET_ACCESS_KEY'],
    endpoint: "https://s3.filebase.com",
    region: "us-east-1",
    s3ForcePathStyle: true,
    signatureVersion: 'v4'
})

export default s3