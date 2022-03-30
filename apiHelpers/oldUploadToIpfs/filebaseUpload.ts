import { VercelRequest } from "@vercel/node";
import AWS from 'aws-sdk';
import { PutObjectRequest } from "aws-sdk/clients/s3";
import randomAlphaString, { randomAlphaLowerString } from '../guiRequestHandlers/helpers/randomAlphaString';

const s3 = new AWS.S3({
    apiVersion: "2006-03-01",
    accessKeyId: process.env['FILEBASE_ACCESS_KEY'],
    secretAccessKey: process.env['FILEBASE_SECRET_ACCESS_KEY'],
    endpoint: "https://s3.filebase.com",
    region: "us-east-1",
    s3ForcePathStyle: true
})

const filebaseUpload = async (req: VercelRequest, size: number, projectId: string) => {
    // We need to do the following, otherwise we get an error in putObject: Cannot determine length of [object Object]
    // (although this does not apply if we are using a buffer, see message below)
    req['length'] = size
    
    const uploadId = randomAlphaLowerString(20)
    const u = uploadId
    const temporaryKey = `projects/${projectId}/uploads/${u[0]}${u[1]}/${u[2]}${u[3]}/${u[4]}${u[5]}/${u}`

    const timer = Date.now()

    // Note that CopyObject is temporarily disabled on filebase
    // Otherwise we would stream the data to the bucket and then
    // once we learn the CID we rename the object.
    // But we can't do that. So instead, we'll create a link
    // object.
    // An alternative would be to compute the CID
    // here using ipfs-only-hash with {rawLeaves: true}
    // but that would requiring loading the data into a buffer
    // which uses too much RAM for a serverless function.

    const params: PutObjectRequest = {
        Bucket: "kachery-cloud",
        Key: temporaryKey,
        ContentType: "application/octet-stream",
        Body: req,
        ACL: "public-read"
    }

    const {cid} = await putObject(params)
    const e = cid.slice(-6)
    const objectKey = `projects/${projectId}/ipfs/${e[0]}${e[1]}/${e[2]}${e[3]}/${e[4]}${e[5]}/${cid}.link`
    const exists = await objectExists(objectKey)
    if (exists) {
        await deleteObject(temporaryKey)
    }
    else {
        const params2: PutObjectRequest = {
            Bucket: "kachery-cloud",
            Key: objectKey,
            ContentType: "application/octet-stream",
            Body: temporaryKey,
            ACL: "public-read",
            Metadata: {
                'link-key': temporaryKey
            }
        }
        await putObject(params2)
    }
    return {cid, elapsed: Date.now() - timer}
}

const putObject = async (params: PutObjectRequest): Promise<{cid: string}> => {
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

const objectExists = async (key: string): Promise<boolean> => {
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

const deleteObject = async (key: string): Promise<void> => {
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

// not using this
// export async function streamToBuffer(stream: Readable): Promise<Buffer> {
//     const chunks = []
//     return new Promise((resolve, reject) => {
//         stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
//         stream.on('error', (err) => reject(err))
//         stream.on('end', () => resolve(Buffer.concat(chunks)))
//     })
// }

export default filebaseUpload