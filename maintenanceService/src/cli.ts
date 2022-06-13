import sleepMsec from "./sleepMsec"
import firestoreDatabase from '../../apiHelpers/common/firestoreDatabase'
import { LogItem, isLogItem } from '../../src/types/LogItem'
import { ProjectUsage, isProjectUsage } from '../../src/types/ProjectUsage'
import fs from 'fs'

const initialProjectUsage = (projectId: string): ProjectUsage => {
    return {
        projectId
    }
}

const main = async () => {
    const credentials = fs.readFileSync('googleCredentials.json', {encoding: 'utf-8'})
    process.env['GOOGLE_CREDENTIALS'] = credentials
    const db = firestoreDatabase()
    const usageLogColletion = db.collection('kacherycloud.usageLog')
    const projectUsagesCollection = db.collection('kacherycloud.projectUsages')
    
    while (true) {
        // const a = await projectUsagesCollection.get()
        // for (let doc of a.docs) {
        //     const pu = doc.data()
        //     if (!isProjectUsage(pu)) {
        //         console.warn(pu)
        //         throw Error('Invalid project usage in database')
        //     }
        //     console.log('=============================')
        //     console.info(pu.projectId)
        //     console.info(pu)
        // }

        const result = await usageLogColletion.orderBy('timestamp').limit(50).get()
        if (result.docs.length > 0) {

            const usageByProject: {[key: string]: ProjectUsage} = {}

            const processLogItem = async (logItem: LogItem) => {
                console.info(`${logItem.type} ${logItem.projectId} ${logItem.userId}`)
                const projectId = logItem.projectId
                if ((projectId) && (!usageByProject[projectId])) {
                    const snapshot = await projectUsagesCollection.doc(projectId).get()
                    const projectUsage0 = snapshot.exists ? snapshot.data() : initialProjectUsage(projectId)
                    if (!isProjectUsage(projectUsage0)) {
                        console.warn(projectUsage0)
                        throw Error('Invalid project usage in database')
                    }
                    usageByProject[projectId] = projectUsage0
                }
                const projectUsage = projectId ? usageByProject[projectId] : {projectId} as ProjectUsage
                let handled = false
                if (logItem.type === 'initiateIpfsUpload') {
                    projectUsage.numInitiatedIpfsUploads = (projectUsage.numInitiatedIpfsUploads || 0) + 1
                    handled = true
                }
                else if (logItem.type === 'finalizeIpfsUpload') {
                    projectUsage.numFinalizedIpfsUploads = (projectUsage.numFinalizedIpfsUploads || 0) + 1
                    projectUsage.numIpfsBytesUploaded = (projectUsage.numIpfsBytesUploaded || 0) + logItem.size
                    handled = true
                }
                else if (logItem.type === 'findIpfsFile') {
                    projectUsage.numIpfsFileFinds = (projectUsage.numIpfsFileFinds || 0) + 1
                    if (logItem.found) {
                        projectUsage.numIpfsFileFindBytes = (projectUsage.numIpfsFileFindBytes || 0) + (logItem.size || 0)
                    }
                    handled = true
                }
                else if (logItem.type === 'initiateFileUpload') {
                    projectUsage.numInitiatedFileUploads = (projectUsage.numInitiatedFileUploads || 0) + 1
                    handled = true
                }
                else if (logItem.type === 'finalizeFileUpload') {
                    projectUsage.numFinalizedFileUploads = (projectUsage.numFinalizedFileUploads || 0) + 1
                    projectUsage.numFileBytesUploaded = (projectUsage.numFileBytesUploaded || 0) + logItem.size
                    handled = true
                }
                else if (logItem.type === 'findFile') {
                    projectUsage.numFileFinds = (projectUsage.numFileFinds || 0) + 1
                    if (logItem.found) {
                        projectUsage.numFileFindBytes = (projectUsage.numFileFindBytes || 0) + (logItem.size || 0)
                    }
                    handled = true
                }
                else if (logItem.type === 'subscribeToPubsubChannel') {
                    if (logItem.channelName === 'feedUpdates') {
                        projectUsage.numSubscribeToFeedUpdates = (projectUsage.numSubscribeToFeedUpdates || 0) + 1
                        handled = true
                    }
                    else if (logItem.channelName === 'provideTasks') {
                        projectUsage.numSubscribeToProvideTasks = (projectUsage.numSubscribeToProvideTasks || 0) + 1
                        handled = true
                    }
                    else if (logItem.channelName === 'requestTasks') {
                        projectUsage.numSubscribeToRequestTasks = (projectUsage.numSubscribeToRequestTasks || 0) + 1
                        handled = true
                    }
                }
                else if (logItem.type === 'publishToPubsubChannel') {
                    if (logItem.channelName === 'feedUpdates') {
                        projectUsage.numPublishToFeedUpdates = (projectUsage.numPublishToFeedUpdates || 0) + 1
                        handled = true
                    }
                    else if (logItem.channelName === 'provideTasks') {
                        projectUsage.numPublishToProvideTasks = (projectUsage.numPublishToProvideTasks || 0) + 1
                        handled = true
                    }
                    else if (logItem.channelName === 'requestTasks') {
                        projectUsage.numPublishToRequestTasks = (projectUsage.numPublishToRequestTasks || 0) + 1
                        handled = true
                    }
                }
                else if (logItem.type === 'initiateTaskResultUpload') {
                    projectUsage.numInitiatedTaskResultUploads = (projectUsage.numInitiatedTaskResultUploads || 0) + 1
                    handled = true
                }
                else if (logItem.type === 'finalizeTaskResultUpload') {
                    projectUsage.numFinalizedTaskResultUploads = (projectUsage.numFinalizedTaskResultUploads || 0) + 1
                    projectUsage.numTaskResultBytesUploaded = (projectUsage.numTaskResultBytesUploaded || 0) + logItem.size
                    handled = true
                }
                else if (logItem.type === 'createFeed') {
                    projectUsage.numFeedsCreated = (projectUsage.numFeedsCreated || 0) + 1
                    handled = true
                }
                else if (logItem.type === 'getFeedInfo') {
                    projectUsage.numGetFeedInfo = (projectUsage.numGetFeedInfo || 0) + 1
                    handled = true
                }
                else if (logItem.type === 'getFeedMessages') {
                    projectUsage.numFeedMessagesRead = (projectUsage.numFeedMessagesRead || 0) + logItem.numMessages
                    handled = true
                }
                else if (logItem.type === 'appendFeedMessages') {
                    projectUsage.numFeedMessagesAppended = (projectUsage.numFeedMessagesAppended || 0) + logItem.numMessages
                    projectUsage.numFeedMessageBytesAppended = (projectUsage.numFeedMessageBytesAppended || 0) + logItem.size
                    handled = true
                }
                else if (logItem.type === 'getMutable') {
                    projectUsage.numGetMutable = (projectUsage.numGetMutable || 0) + 1
                    handled = true
                }
                else if (logItem.type === 'setMutable') {
                    projectUsage.numSetMutable = (projectUsage.numSetMutable || 0) + 1
                    handled = true
                }
                if (handled) {
                    projectUsage.numLogItems = (projectUsage.numLogItems || 0) + 1
                }
                return handled
            }

            console.log(`Processing ${result.docs.length} log items`)
            for (let usageDoc of result.docs) {
                const logItem = usageDoc.data()
                if (!isLogItem(logItem)) {
                    console.warn('Invalid log item:')
                    console.warn(logItem)
                    if ((logItem.type === 'initiateTaskResultUpload') && (logItem.taskType) && (logItem.taskInputHash)) {
                        await usageDoc.ref.delete() // only during development
                    }
                    else if ((logItem.type === 'finalizeTaskResultUpload') && (logItem.taskType) && (logItem.taskInputHash)) {
                        await usageDoc.ref.delete() // only during development
                    }
                    else {
                        throw Error('Invalid log item')
                    }
                    // await usageDoc.ref.delete() // only during development
                }
                else {
                    const handled = await processLogItem(logItem)
                    if (handled) {
                        usageDoc.ref.delete()
                    }
                }
            }
            for (let projectId in usageByProject) {
                await projectUsagesCollection.doc(projectId).set(usageByProject[projectId])
            }
        }
        else {
            console.warn('No more log items to process. Waiting 60 seconds.')
            await sleepMsec(60 * 1000)
        }
        
        await sleepMsec(500)
    }
}
main()