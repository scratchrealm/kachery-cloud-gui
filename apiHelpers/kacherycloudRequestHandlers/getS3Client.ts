import AWS from 'aws-sdk';
import { Bucket } from '../../src/types/Bucket';

interface PutObjectRequestParamsX {
    Bucket: any
    Key: any
}

interface PutObjectRequestX {
    on: (event: string, listener: any) => void
    send: () => void
}

interface HeadObjectParamsX {
    Bucket: any
    Key: any
}

interface GetObjectParamsX {
    Bucket: any
    Key: any
}

interface DeleteObjectParamsX {
    Bucket: any
    Key: any
}

interface GetSignedUrlParamsX {
    Bucket: any
    Key: any
    Expires: number
}

export interface HeadObjectOutputX {
    ContentLength?: number
    Metadata?: any
}

interface S3Client {
    putObject: (params: PutObjectRequestParamsX) => PutObjectRequestX
    headObject: (params: HeadObjectParamsX, callback: (err?: any & {statusCode: number}, data?: HeadObjectOutputX) => void) => void
    getObject: (params: GetObjectParamsX, callback: (err?: any, data?: any) => void) => void
    deleteObject: (params: DeleteObjectParamsX, callback: (err?: any) => void) => void
    getSignedUrl: (operation: string, params: GetSignedUrlParamsX, callback: (err?: any, url?: string) => void) => void
}

const defaultS3Client = new AWS.S3({
    apiVersion: "2006-03-01",
    accessKeyId: process.env['FILEBASE_ACCESS_KEY'],
    secretAccessKey: process.env['FILEBASE_SECRET_ACCESS_KEY'],
    endpoint: "https://s3.filebase.com",
    region: "us-east-1",
    s3ForcePathStyle: true,
    signatureVersion: 'v4'
})

const getS3Client = (bucket?: Bucket): S3Client => {
    if (!bucket) {
        return defaultS3Client
    }
    throw Error('Not yet implemented')
}

export default getS3Client