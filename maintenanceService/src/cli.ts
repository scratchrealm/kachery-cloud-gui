import sleepMsec from "./sleepMsec"
import firestoreDatabase from '../../apiHelpers/common/firestoreDatabase'
import { LogItem, isLogItem } from '../../src/types/LogItem'
import { isNumber, isString, optional, _validateObject } from "../../src/commonInterface/kacheryTypes"

type ProjectUsage = {
    projectId: string
    numInitializedIpfsUploads?: number
    numFinalizedIpfsUploads?: number
    numIpfsBytesUploaded?: number
}

const isProjectUsage = (x: any): x is ProjectUsage => (
    _validateObject(x, {
        projectId: isString,
        numInitializedIpfsUploads: optional(isNumber),
        numFinalizedIpfsUploads: optional(isNumber),
        numIpfsBytesUploaded: optional(isNumber)
    })
)

const main = async () => {
    const db = firestoreDatabase()
    const usageLogColletion = db.collection('kacherycloud.usageLog')
    const projectUsagesCollection = db.collection('kacherycloud.projectUsages')
    
    while (true) {
        const usageByProject: {[key: string]: ProjectUsage} = {}

        const processLogItem = async (logItem: LogItem) => {
            const projectId = logItem.projectId
            if ((projectId) && (!usageByProject[projectId])) {
                const snapshot = await projectUsagesCollection.doc(projectId).get()
                const projectUsage0 = snapshot.exists ? snapshot.data() : {projectId}
                if (!isProjectUsage(projectUsage0)) {
                    console.warn(projectUsage0)
                    throw Error('Invalid project usage in database')
                }
                usageByProject[projectId] = projectUsage0
            }
            const projectUsage = projectId ? usageByProject[projectId] : {projectId} as ProjectUsage
            if (logItem.type === 'initiateIpfsUpload') {
                projectUsage.numInitializedIpfsUploads = (projectUsage.numInitializedIpfsUploads || 0) + 1
            }
        }

        const result = await usageLogColletion.limit(20).get()
        if (result.docs.length > 0) {
            console.log(`Processing ${result.docs.length} log items`)
            for (let usageDoc of result.docs) {
                const logItem = usageDoc.data()
                if (!isLogItem(logItem)) {
                    console.warn('Invalid log item:')
                    console.warn(logItem)
                    await usageDoc.ref.delete() // only during development
                }
                else {
                    await processLogItem(logItem)
                }
            }
            for (let projectId in usageByProject) {
                await projectUsagesCollection.doc(projectId).set(usageByProject[projectId])
            }
        }
        const a = await projectUsagesCollection.get()
        for (let doc of a.docs) {
            console.log('=============================')
            console.log(doc.data())
        }
        await sleepMsec(5000)
    }
}
main()