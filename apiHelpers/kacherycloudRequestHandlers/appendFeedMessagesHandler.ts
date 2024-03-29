import { isJSONObject, isNumber, isString, JSONObject, NodeId, UserId, _validateObject } from "../../src/commonInterface/kacheryTypes";
import { isFeedRecord } from "../../src/types/FeedRecord";
import { AppendFeedMessagesRequest, AppendFeedMessagesResponse } from "../../src/types/KacherycloudRequest";
import { AppendFeedMessagesLogItem } from "../../src/types/LogItem";
import firestoreDatabase from '../common/firestoreDatabase';

const MAX_FEED_MESSAGE_SIZE = 500 * 1000
const MAX_NUM_FEED_MESSAGES_TO_APPEND = 100

export type FeedMessageDocument = {
    feedId: string
    messageNumber: number
    userId: UserId
    timestamp: number
    message: JSONObject
}
export const isFeedMessageDocument = (x: any): x is FeedMessageDocument => {
    return _validateObject(x, {
        feedId: isString,
        messageNumber: isNumber,
        userId: isString,
        timestamp: isNumber,
        message: isJSONObject
    })
}

const appendFeedMessagesHandler = async (request: AppendFeedMessagesRequest, verifiedClientId?: NodeId): Promise<AppendFeedMessagesResponse> => {
    const { feedId, messagesJson } = request.payload

    const clientId = verifiedClientId
    if (!clientId) {
        throw Error('No verified client ID')
    }

    if (messagesJson.length > MAX_NUM_FEED_MESSAGES_TO_APPEND) {
        throw Error(`Too many feed messages to append: ${messagesJson.length} > ${MAX_NUM_FEED_MESSAGES_TO_APPEND}`)
    }
    if (messagesJson.length === 0) {
        throw Error('Length of messages has to be greater than zero.')
    }
    for (let messageJson of messagesJson) {
        if (messageJson.length > MAX_FEED_MESSAGE_SIZE) {
            throw Error(`Message is too large: ${JSON.stringify(messageJson).length} > ${MAX_FEED_MESSAGE_SIZE}`)
        }
    }

    // const client = await getClient(clientId)

    const db = firestoreDatabase()

    const feedsCollection = db.collection('kacherycloud.feeds')
    const feedSnapshot = await feedsCollection.doc(feedId).get()
    if (!feedSnapshot.exists) {
        throw Error(`Feed not found: ${feedId}`)
    }
    const feedRecord = feedSnapshot.data()
    if (!isFeedRecord(feedRecord)) {
        throw Error('Invalid feed record in database')
    }
    const projectId = feedRecord.projectId

    // const userId = client.ownerId

    // const project = await getProject(projectId)

    // const pm = await getProjectMembership(projectId, userId)
    // if ((!pm) || (!pm.permissions.write)) {
    //     throw Error(`User ${userId} does not have write access on project ${projectId}`)
    // }

    const feedMessagesCollection = feedSnapshot.ref.collection('messages')

    const getLastMessageNumber = async () => {
        const lastMessagesSnapshot = await feedMessagesCollection
            .orderBy('messageNumber', 'asc')
            .limitToLast(1).get()
        if (lastMessagesSnapshot.docs.length > 1) {
            throw Error('Unexpected more than one doc')
        }
        return lastMessagesSnapshot.docs.length === 1 ?
            lastMessagesSnapshot.docs[0].data()['messageNumber'] : -1
    }

    let lastMessageNumber = await getLastMessageNumber()
    for (let msgJson of messagesJson) {
        let numFails = 0
        while (true) {
            const messageDoc: FeedMessageDocument = {
                feedId,
                messageNumber: lastMessageNumber + 1,
                userId: '' as any as UserId,
                timestamp: Date.now(),
                message: JSON.parse(msgJson)
            }
            const key = `${feedId}.${lastMessageNumber + 1}`
            try {
                await feedMessagesCollection.doc(key).create(messageDoc)
                lastMessageNumber ++
                break
            }
            catch {
                numFails ++
                if (numFails >= 6) {
                    throw Error(`Aborting after six fails`)
                }
                lastMessageNumber = await getLastMessageNumber()
            }
        }
    }

    // const pubsubChannelName = `new.${projectId}.feedUpdates`
    // const pubsubMessage: PubsubMessage = {
    //     type: 'feedMessagesAppended',
    //     projectId,
    //     feedId,
    //     numMessagesAppended: messagesJson.length
    // }
    // await publishPubsubMessage(pubsubChannelName, pubsubMessage)

    const usageLogCollection = db.collection('kacherycloud.usageLog')
    const logItem: AppendFeedMessagesLogItem = {
        type: 'appendFeedMessages',
        clientId: verifiedClientId,
        projectId,
        userId: '' as any as UserId,
        feedId,
        numMessages: messagesJson.length,
        size: sum(messagesJson.map(messageJson => (messageJson.length))),
        timestamp: Date.now()
    }
    await usageLogCollection.add(logItem)

    return {
        type: 'appendFeedMessages'
    }
}

const sum = (x: number[]) => {
    return x.reduce((a, c) => (a + c), 0)
}

export default appendFeedMessagesHandler