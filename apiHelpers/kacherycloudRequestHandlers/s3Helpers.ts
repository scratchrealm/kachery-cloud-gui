import s3 from "./s3";
import { HeadObjectOutput, PutObjectRequest } from "aws-sdk/clients/s3";

export const putObject = async (params: PutObjectRequest): Promise<{cid: string}> => {
    return new Promise<{cid: string}>((resolve, reject) => {
        const request = s3.putObject(params)
        request.on('error', (err) => {
            reject(new Error(`Error uploading to filebase: ${err.message}`)) 
        })
        request.on('httpHeaders', (statusCode, headers, response, statusMessage) => {
            if (statusCode !== 200) {
                reject(`Error uploading to filebase * (${statusCode}): ${statusMessage}`)
                return
            }
            const cid = headers['x-amz-meta-cid']
            
            resolve({cid})
        })
        request.send()
    })
}

export const headObject = async (key: string): Promise<HeadObjectOutput> => {
    return new Promise((resolve, reject) =>{
        s3.headObject({
            Bucket: 'kachery-cloud',
            Key: key
        }, (err, data) => {
            if (err) {
                reject(new Error(`Error gettings metadata for object: ${err.message}`))
            }
            resolve(data)
        })
    })
}

export const getObjectContent = async (key: string): Promise<any> => {
    return new Promise((resolve, reject) =>{
        s3.getObject({
            Bucket: 'kachery-cloud',
            Key: key
        }, (err, data) => {
            if (err) {
                reject(new Error(`Error gettings metadata for object: ${err.message}`))
            }
            resolve(data.Body)
        })
    })
}

export const deleteObject = async (key: string): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        s3.deleteObject({
            Bucket: 'kachery-cloud',
            Key: key
        }, (err, data) => {
            if (err) {
                reject(new Error('Problem deleting object'))
            }
            else {
                resolve()
            }
        })
    })
}

export const objectExists = async (key: string): Promise<boolean> => {
    return new Promise<boolean>((resolve, reject) => {
        s3.headObject({
            Bucket: 'kachery-cloud',
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

export const getSignedUploadUrl = async (key: string): Promise<string> => {
    return new Promise((resolve, reject) =>{
        s3.getSignedUrl('putObject', {
            Bucket: 'kachery-cloud',
            Key: key,
            Expires: 60 * 1 // seconds
        }, (err, url) => {
            if (err) {
                reject(new Error(`Error gettings signed url: ${err.message}`))
            }
            resolve(url)
        })
    })
}