import { PutObjectRequest } from "aws-sdk/clients/s3";
import { Bucket } from "../../src/types/Bucket";
import getS3Client, { HeadObjectOutputX } from "./getS3Client";

const bucketNameFromUri = (uri: string) => {
    if (!uri) return undefined
    return uri.split('?')[0].split('/')[2]
}

export const putObject = async (bucket: Bucket, params: PutObjectRequest): Promise<{cid: string}> => {
    return new Promise<{cid: string}>((resolve, reject) => {
        const s3 = getS3Client(bucket)
        const request = s3.putObject(params)
        request.on('error', (err: Error) => {
            reject(new Error(`Error uploading to bucket: ${err.message}`)) 
        })
        request.on('httpHeaders', (statusCode, headers, response, statusMessage) => {
            if (statusCode !== 200) {
                reject(`Error uploading to bucket * (${statusCode}): ${statusMessage}`)
                return
            }
            const cid = headers['x-amz-meta-cid']
            
            resolve({cid})
        })
        request.send()
    })
}

export const headObject = async (bucket: Bucket, key: string): Promise<HeadObjectOutputX> => {
    return new Promise<any>((resolve, reject) => {
        const s3 = getS3Client(bucket)
        s3.headObject({
            Bucket: bucketNameFromUri(bucket.uri),
            Key: key
        }, (err: Error, data) => {
            if (err) {
                reject(new Error(`Error gettings metadata for object: ${err.message}`))
                return
            }
            resolve(data)
        })
    })
}

export const getObjectContent = async (bucket: Bucket, key: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        const s3 = getS3Client(bucket)
        s3.getObject({
            Bucket: bucketNameFromUri(bucket.uri),
            Key: key
        }, (err, data) => {
            if (err) {
                reject(new Error(`Error gettings metadata for object: ${err.message}`))
                return
            }
            resolve(data.Body)
        })
    })
}

export const deleteObject = async (bucket: Bucket, key: string): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        const s3 = getS3Client(bucket)
        s3.deleteObject({
            Bucket: bucketNameFromUri(bucket.uri),
            Key: key
        }, (err) => {
            if (err) {
                reject(new Error('Problem deleting object'))
            }
            else {
                resolve()
            }
        })
    })
}

export const objectExists = async (bucket: Bucket, key: string): Promise<boolean> => {
    return new Promise<boolean>((resolve, reject) => {
        const s3 = getS3Client(bucket)
        s3.headObject({
            Bucket: bucketNameFromUri(bucket.uri),
            Key: key
        }, (err, data) => {
            if (err) {
                if (err.statusCode === 404) { // not found
                    resolve(false)
                }
                else {
                    reject(new Error('Unexpected status code for headObject'))
                }
            }
            else {
                resolve(true)
            }
        })
    })
}

export const getSignedUploadUrl = async (bucket: Bucket, key: string): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        const s3 = getS3Client(bucket)
        s3.getSignedUrl('putObject', {
            Bucket: bucketNameFromUri(bucket.uri),
            Key: key,
            Expires: 60 * 30 // seconds
        }, (err, url) => {
            if (err) {
                reject(new Error(`Error getting signed url: ${err.message}`))
                return
            }
            if (!url) {
                reject(new Error('Unexpected, url is undefined'))
                return
            }
            resolve(url)
        })
    })
}