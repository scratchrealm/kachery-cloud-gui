import { NodeId } from "../../src/commonInterface/kacheryTypes";
import { SubscribeToPubsubChannelRequest, SubscribeToPubsubChannelResponse } from "../../src/types/KacherycloudRequest";
import { SubscribeToPubsubChannelLogItem } from "../../src/types/LogItem";
import firestoreDatabase from '../common/firestoreDatabase';
import { getClient, getProject, getProjectMembership } from "../common/getDatabaseItems";
import pubnub, { subscribeKey } from '../common/pubnub';

const subscribeToPubsubChannelHandler = async (request: SubscribeToPubsubChannelRequest, verifiedClientId: NodeId | undefined): Promise<SubscribeToPubsubChannelResponse> => {
    const { channelName } = request.payload

    const clientId = verifiedClientId

    const client = clientId ? await getClient(clientId) : undefined

    const projectId = request.payload.projectId || client?.defaultProjectId
    if (!projectId) throw Error('No project ID')

    const userId = client ? client.ownerId : undefined
    // make sure project exists
    await getProject(projectId)

    const projectMembership = userId ? await getProjectMembership(projectId, userId) : undefined

    if (channelName === 'provideTasks') {
        // okay - anyone can subscribe to this
    }
    else if (channelName === 'requestTasks') {
        if (!projectMembership?.permissions?.write) {
            throw Error('Not authorized to subscribe to the requestTasks pubsub channel for this project')
        }
    }
    else if (channelName === 'feedUpdates') {
        // okay - anyone can subscribe to this
    }
    else {
        throw Error(`Unexpected channel ${channelName}`)
    }

    const pubsubChannelName = `new.${projectId}.${channelName}`

    const uuid = request.payload.uuid || (clientId ? clientId.toString() : 'kachery-cloud-anonymous')
    const token = await grantSubscribeToken({uuid, pubsubChannelName})

    const db = firestoreDatabase()
    const usageLogCollection = db.collection('kacherycloud.usageLog')
    const logItem: SubscribeToPubsubChannelLogItem = {
        type: 'subscribeToPubsubChannel',
        clientId: client?.clientId,
        projectId,
        userId,
        channelName,
        timestamp: Date.now()
    }
    await usageLogCollection.add(logItem)

    return {
        type: 'subscribeToPubsubChannel',
        token,
        subscribeKey,
        uuid,
        pubsubChannelName
    }
}

const grantSubscribeToken = async (o: {uuid: string, pubsubChannelName: string}) => {
    return new Promise<string>((resolve, reject) => {
        pubnub.grantToken({
            ttl: 30, // token is good for 30 minutes
            authorized_uuid: o.uuid,
            resources: {
                channels: {
                    [o.pubsubChannelName]: {
                        read: true
                    }
                }
            }
        }, function (status, token) {
            if (status.error) {
                reject(status.errorData)
                return
            }
            resolve(token)
        })
    })
}

export default subscribeToPubsubChannelHandler