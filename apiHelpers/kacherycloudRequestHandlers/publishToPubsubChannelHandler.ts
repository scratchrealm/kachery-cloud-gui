import { NodeId } from "../../src/commonInterface/kacheryTypes";
import { PublishToPubsubChannelRequest, PublishToPubsubChannelResponse } from "../../src/types/KacherycloudRequest";
import { PublishToPubsubChannelLogItem } from "../../src/types/LogItem";
import { PubsubMessage } from "../../src/types/PubsubMessage";
import firestoreDatabase from '../common/firestoreDatabase';
import { getClient, getProject, getProjectMembership } from "../common/getDatabaseItems";
import pubnub from '../common/pubnub';

const publishToPubsubChannelHandler = async (request: PublishToPubsubChannelRequest, verifiedClientId: NodeId | undefined): Promise<PublishToPubsubChannelResponse> => {
    const { channelName, message } = request.payload

    const clientId = verifiedClientId

    const client = clientId ? await getClient(clientId) : undefined

    const projectId = request.payload.projectId || client?.defaultProjectId
    if (!projectId) throw Error('No project ID')

    const userId = client ? client.ownerId : undefined
    // make sure project exists
    await getProject(projectId)

    const projectMembership = userId ? await getProjectMembership(projectId, userId) : undefined

    if (channelName === 'provideTasks') {
        if (!projectMembership?.permissions?.write) {
            throw Error('Not authorized to publish to the requestTasks pubsub channel for this project')
        }
        if (message.type === 'setTaskStatus') {
            // okay
        }
        else {
            throw Error('Invalid task for this channel')
        }
    }
    else if (channelName === 'requestTasks') {
        // okay - anyone can publish to this
        if (message.type === 'requestTask') {
            // okay
        }
        else {
            throw Error('Invalid task for this channel')
        }
    }
    else {
        throw Error(`Unexpected channel ${channelName}`)
    }

    const pubsubChannelName = `${projectId}.${channelName}`
    await publishMessage(pubsubChannelName, message)

    const db = firestoreDatabase()
    const usageLogCollection = db.collection('kacherycloud.usageLog')
    const logItem: PublishToPubsubChannelLogItem = {
        type: 'publishToPubsubChannel',
        clientId: client?.clientId,
        projectId,
        userId,
        channelName,
        messageType: message.type,
        timestamp: Date.now()
    }
    await usageLogCollection.add(logItem)

    return {
        type: 'publishToPubsubChannel'
    }
}

const publishMessage = async (pubsubChannelName: string, message: PubsubMessage) => {
    return new Promise<void>((resolve, reject) => {
        pubnub.publish(
            {
                message,
                channel: pubsubChannelName
            },
            function (status, response) {
                if (status.error) {
                    reject(status.errorData)
                    return
                }
                resolve()
            }
        )        
    })
}


export default publishToPubsubChannelHandler