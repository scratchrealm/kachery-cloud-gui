import axios from "axios";
import { TimingRequest, TimingResponse } from "../../src/types/TimingRequest";
import { randomAlphaLowerString } from "../guiRequestHandlers/helpers/randomAlphaString";
import { deleteObject, getObjectContent, getSignedUploadUrl, putObject } from "../kacherycloudRequestHandlers/s3Helpers";

const Bucket = 'kachery-cloud'

const timingHandler = async (request: TimingRequest): Promise<TimingResponse> => {

    let timer = Date.now()

    const content1 = randomAlphaLowerString(20)
    const content2 = randomAlphaLowerString(20)
    const content3 = randomAlphaLowerString(20)
    const Key1 = `timingTests/${randomAlphaLowerString(10)}.1.txt`
    const Key2 = `timingTests/${randomAlphaLowerString(10)}.2.txt`
    const Key3 = `timingTests/${randomAlphaLowerString(10)}.3.txt`

    timer = Date.now()
    await putObject({Bucket, Key: Key1, Body: content1})
    const putFilebaseObject = Date.now() - timer

    timer = Date.now()
    const signedUploadUrl = await getSignedUploadUrl(Key2)
    const getFilebaseSignedUploadUrl = Date.now() - timer

    timer = Date.now()
    await axios.put(signedUploadUrl, content2)
    const putFilebaseObjectUsingUploadUrl = Date.now() - timer

    timer = Date.now()
    const objectContent2 = await getObjectContent(Key2)
    if (objectContent2.toString('ascii') !== content2) {
        throw Error('Unexpected content mismatch content2')
    }
    const getFilebaseObject = Date.now() - timer

    timer = Date.now()
    const objectContent1 = (await axios.get(`https://${Bucket}.s3.filebase.com/${Key1}`)).data
    if (objectContent1.toString('ascii') !== content1) {
        throw Error('Unexpected content mismatch content1')
    }
    const getFilebaseObjectViaHttp = Date.now() - timer

    timer = Date.now()
    await deleteObject(Key1)
    const deleteFilebaseObject = Date.now() - timer

    await deleteObject(Key2)

    const {cid} = await putObject({Bucket, Key: Key3, Body: content3})
    let downloadFromIPFSGateway = 0
    let response3
    try {
        timer = Date.now()
        const resp3= await axios.get(`https://ipfs.filebase.io/ipfs/${cid}`, {timeout: 4000})
        response3 = resp3.data
        downloadFromIPFSGateway = Date.now() - timer
    }
    catch(err) {
        downloadFromIPFSGateway = -1
    }
    if (response3.toString('ascii') !== content3) {
        throw Error('Unexpected content mismatch')
    }

    return {
        type: 'timing',
        elapsedTimesMsec: {
            putFilebaseObject,
            getFilebaseSignedUploadUrl,
            putFilebaseObjectUsingUploadUrl,
            getFilebaseObject,
            getFilebaseObjectViaHttp,
            deleteFilebaseObject,
            downloadFromIPFSGateway
        }
    }
}

export default timingHandler