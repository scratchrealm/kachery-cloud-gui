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
    const content4 = randomAlphaLowerString(20)
    const Key1 = `timingTests/${randomAlphaLowerString(10)}.1.txt`
    const Key2 = `timingTests/${randomAlphaLowerString(10)}.2.txt`
    const Key3 = `timingTests/${randomAlphaLowerString(10)}.3.txt`
    const Key4 = `timingTests/${randomAlphaLowerString(10)}.4.txt`

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

    const {cid: cid3} = await putObject({Bucket, Key: Key3, Body: content3})
    let downloadFromIPFSGateway = 0
    let response3: any
    try {
        timer = Date.now()
        const resp3= await axios.get(`https://ipfs.filebase.io/ipfs/${cid3}`, {timeout: 4000})
        response3 = resp3.data
        downloadFromIPFSGateway = Date.now() - timer
    }
    catch(err) {
        downloadFromIPFSGateway = -1
    }
    if (response3.toString('ascii') !== content3) {
        throw Error('Unexpected content mismatch')
    }

    const {cid: cid4} = await putObject({Bucket, Key: Key4, Body: content4})
    await sleepMsec(3000)
    let downloadFromIPFSGatewayAfterDelay = 0
    let response4: any
    try {
        timer = Date.now()
        const resp4= await axios.get(`https://ipfs.filebase.io/ipfs/${cid4}`, {timeout: 4000})
        response4 = resp4.data
        downloadFromIPFSGatewayAfterDelay = Date.now() - timer
    }
    catch(err) {
        downloadFromIPFSGatewayAfterDelay = -1
    }
    if (response4.toString('ascii') !== content4) {
        throw Error('Unexpected content mismatch')
    }

    await deleteObject(Key3)
    await deleteObject(Key4)

    return {
        type: 'timing',
        elapsedTimesMsec: {
            putFilebaseObject,
            getFilebaseSignedUploadUrl,
            putFilebaseObjectUsingUploadUrl,
            getFilebaseObject,
            getFilebaseObjectViaHttp,
            deleteFilebaseObject,
            downloadFromIPFSGateway,
            downloadFromIPFSGatewayAfterDelay
        },
        misc: {
            deletedCIDExample: cid3
        }
    }
}

const sleepMsec = async (ms: number) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}

export default timingHandler