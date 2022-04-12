import PubNub from 'pubnub'

export const subscribeKey = process.env['PUBNUB_SUBSCRIBE_KEY']
export const publishKey = process.env['PUBNUB_PUBLISH_KEY']
const secretKey = process.env['PUBNUB_SECRET_KEY']
const uuid =  process.env['PUBNUB_UUID']

var pubnub = new PubNub({
    subscribeKey,
    publishKey,
    secretKey,
    uuid
})

export default pubnub