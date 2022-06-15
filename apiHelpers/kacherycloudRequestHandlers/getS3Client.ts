import AWS from 'aws-sdk';
import { sha1OfString } from '../../src/commonInterface/kacheryTypes';
import { Bucket } from '../../src/types/Bucket';
import { ObjectCache } from '../common/getDatabaseItems';

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

// const defaultS3Client = new AWS.S3({
//     apiVersion: "2006-03-01",
//     accessKeyId: process.env['FILEBASE_ACCESS_KEY'],
//     secretAccessKey: process.env['FILEBASE_SECRET_ACCESS_KEY'],
//     endpoint: "https://s3.filebase.com",
//     region: "us-east-1",
//     s3ForcePathStyle: true,
//     signatureVersion: 'v4'
// })

const expirationMSec = 1000 * 60 * 10
const s3ClientObjectCache = new ObjectCache<S3Client>(expirationMSec)

const getS3Client = (bucket: Bucket): S3Client => {
    const k = `${bucket.bucketId}:${bucket.uri}:${sha1OfString(bucket.credentials)}`
    const x = s3ClientObjectCache.get(k)
    if (x) return x
    let ret: S3Client
    if (['filebase', 'aws', 'wasabi', 'google'].includes(bucket.service)) {
        const cred = JSON.parse(bucket.credentials || '{}')
        for (let k of ['accessKeyId', 'secretAccessKey']) {
            if (!cred[k]) {
                throw Error(`Missing in credentals: ${k}`)
            }
        }
        const region = cred.region
        const accessKeyId = cred.accessKeyId
        const secretAccessKey = cred.secretAccessKey
        const o: any = {
            apiVersion: "2006-03-01",
            accessKeyId,
            secretAccessKey,
            region,
            s3ForcePathStyle: true,
            signatureVersion: 'v4'
        }
        if (bucket.service === 'filebase') {
            o.endpoint = "https://s3.filebase.com"
        }
        else if (bucket.service === 'wasabi') {
            if (!region) {
                throw Error('Missing region in credentials')
            }
            o.endpoint = `https://s3.${region}.wasabisys.com`
        }
        else if (bucket.service === 'google') {
            o.endpoint = "https://storage.googleapis.com"
        }
        ret = new AWS.S3(o)
    }
    else {
        throw Error(`Unsupported bucket service: ${bucket.service}`)
    }
    s3ClientObjectCache.set(k, ret)
    return ret
}

export default getS3Client