import guiApiRequest from 'common/guiApiRequest';
import Hyperlink from 'commonComponents/Hyperlink/Hyperlink';
import NiceTable from 'commonComponents/NiceTable/NiceTable';
import { useSignedIn } from 'components/googleSignIn/GoogleSignIn';
import formatByteCount from 'components/misc/formatByteCount';
import useRoute from 'components/useRoute';
import useErrorMessage from 'errorMessageContext/useErrorMessage';
import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { AdminGetProjectsRequest, isAdminGetProjectsResponse } from 'types/GuiRequest';
import { Project } from 'types/Project';
import { ProjectUsage } from 'types/ProjectUsage';
import { timeSince } from './ProjectsTable';

type Props = {
}

const AdminPage: FunctionComponent<Props> = () => {
    const [projects, setProjects] = useState<Project[] | undefined>(undefined)
    const [projectUsages, setProjectUsages] = useState<ProjectUsage[] | undefined>(undefined)
    const {userId, googleIdToken} = useSignedIn()
    const {setErrorMessage} = useErrorMessage()
    const {setRoute} = useRoute()

    const columns = useMemo(() => ([
        {
            key: 'project',
            label: 'Project'
        },
        {
            key: 'label',
            label: 'Label'
        },
        {
            key: 'ownerId',
            label: 'Owner'
        },
        {
            key: 'timestampCreated',
            label: 'Created'
        },
        {
            key: 'timestampLastModified',
            label: 'Modified'
        },
        {
            key: 'usage',
            label: 'Usage'
        }
    ]), [])

    const projectUsagesById = useMemo(() => {
        if (!projectUsages) return undefined
        const ret: {[key: string]: ProjectUsage} = {}
        for (let x of projectUsages) {
            ret[x.projectId] = x
        }
        return ret
    }, [projectUsages])

    const rows = useMemo(() => (
        (projects || []).sort((p1, p2) => (p2.timestampLastModified - p1.timestampLastModified)).map((project) => {
            const usage = projectUsagesById ? projectUsagesById[project.projectId] : undefined
            const usageText = `${formatByteCount(usage?.numFileBytesUploaded || 0)} / ${formatByteCount(usage?.numTaskResultBytesUploaded || 0)} / ${usage?.numFeedMessagesAppended || 0} / ${formatByteCount(usage?.numIpfsFileFindBytes || 0)}`
            return {
                key: project.projectId.toString(),
                columnValues: {
                    project: {
                        text: project.label,
                        element: (
                            <Hyperlink onClick={() => {setRoute({page: 'project', projectId: project.projectId})}}>
                                {project.label} ({project.projectId})
                            </Hyperlink>
                        )
                    },
                    label: project.label,
                    ownerId: project.ownerId.toString(),
                    timestampCreated: timeSince(project.timestampCreated),
                    timestampLastModified: timeSince(project.timestampLastModified),
                    usage: usageText
                }
            }
        })
    ), [projects, projectUsagesById, setRoute])

    useEffect(() => {
        if (!userId) return
        ;(async () => {
            const req: AdminGetProjectsRequest = {
                type: 'adminGetProjects',
                auth: {userId, googleIdToken}
            }
            const resp = await guiApiRequest(req, {reCaptcha: false, setErrorMessage})
            if (!isAdminGetProjectsResponse(resp)) throw Error('Invalid response')
            setProjects(resp.projects)
            setProjectUsages(resp.projectUsages)
        })()
    }, [userId, googleIdToken, setErrorMessage])
    if (!projects) {
        return <div>Loading projects...</div>
    }
    return (
        <div>
            <NiceTable
                rows={rows}
                columns={columns}
            />
        </div>
    )
}

export default AdminPage