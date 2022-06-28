import { Table, TableBody, TableCell, TableRow } from '@material-ui/core';
import guiApiRequest from 'common/guiApiRequest';
import Hyperlink from 'commonComponents/Hyperlink/Hyperlink';
import { useSignedIn } from 'components/googleSignIn/GoogleSignIn';
import useRoute from 'components/useRoute';
import useErrorMessage from 'errorMessageContext/useErrorMessage';
import { FunctionComponent, useCallback, useMemo } from 'react';
import { SetProjectInfoRequest } from 'types/GuiRequest';
import EditableBucketSelect from './EditableBucketSelect';
import EditableTextField from './EditableTextField';
import ProjectMembershipsTable from './ProjectMembershipsTable';
import ProjectSettingsView from './ProjectSettingsView';
import ProjectUsageView from './ProjectUsageView';
import useBucket from './useBucket';
import useProject from './useProject';

type Props = {
    projectId: string
}

const ProjectPage: FunctionComponent<Props> = ({projectId}) => {
    const { project, projectMemberships, addProjectMembership, deleteProjectMembership, setProjectSettings, refreshProject } = useProject(projectId)
    const { bucket } = useBucket(project?.bucketId)
    const { setRoute } = useRoute()

    const { setErrorMessage } = useErrorMessage()

    const { userId, googleIdToken } = useSignedIn()

    const handleChangeLabel = useCallback((newLabel: string) => {
        if (!userId) return
        if (!googleIdToken) return
        ;(async () => {
            const req: SetProjectInfoRequest = {
                type: 'setProjectInfo',
                projectId,
                label: newLabel,
                auth: {userId, googleIdToken}
            }
            await guiApiRequest(req, {reCaptcha: true, setErrorMessage})
            refreshProject()
        })()
    }, [userId, googleIdToken, projectId, refreshProject, setErrorMessage])

    const handleChangeBucket = useCallback((newBucketId: string | undefined) => {
        if (!userId) return
        if (!googleIdToken) return
        ;(async () => {
            const req: SetProjectInfoRequest = {
                type: 'setProjectInfo',
                projectId,
                bucketId: newBucketId,
                auth: {userId, googleIdToken}
            }
            await guiApiRequest(req, {reCaptcha: true, setErrorMessage})
            refreshProject()
        })()
    }, [userId, googleIdToken, projectId, refreshProject, setErrorMessage])

    const tableData = useMemo(() => {
        if (!project) return undefined
        return [
            {
                key: 'projectLabel',
                label: 'Project label',
                value: (
                    <EditableTextField
                        value={project.label}
                        onChange={handleChangeLabel}
                    />
                )
            },
            { key: 'projectId', label: 'Project ID', value: project.projectId.toString() },
            { key: 'ownerId', label: 'Owner', value: project.ownerId.toString() },
            {
                key: 'bucketId',
                label: 'Bucket',
                value: (
                    <EditableBucketSelect
                        bucket={bucket}
                        onChange={handleChangeBucket}
                        onClick={bucket ? () => {setRoute({page: 'bucket', bucketId: bucket.bucketId || ''})} : undefined}
                    />
                )
            },
            { key: 'timestampCreated', label: 'Created', value: `${new Date(project.timestampCreated)}` },
            { key: 'timestampLastModified', label: 'Modified', value: `${new Date(project.timestampLastModified)}` }
        ]
    }, [project, handleChangeLabel, handleChangeBucket, setRoute, bucket])

    const handleBack = useCallback(() => {
        setRoute({page: 'home'})
    }, [setRoute])

    const handleTestTaskBackend = useCallback(() => {
        setRoute({page: 'testTaskBackend', projectId})
    }, [setRoute, projectId])

    if (!project) {
        return <span>Loading...</span>
    }

    if (!projectMemberships) {
        return <span>Loading...</span>
    }

    if (!tableData) return <div />
    return (
        <div>
            <p /><hr /><p />
            <Hyperlink onClick={handleBack}>Back</Hyperlink>
            <Table className="NiceTable2">
                <TableBody>
                    {
                        tableData.map(x => (
                            <TableRow key={x.key}>
                                <TableCell>{x.label}: </TableCell>
                                <TableCell style={{wordBreak: 'break-word'}}>{x.value}</TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
            <p /><hr /><p />
            <ProjectSettingsView
                projectId={project.projectId}
                projectSettings={project.settings}
                setProjectSettings={setProjectSettings}
            />
            <p /><hr /><p />
            <ProjectMembershipsTable
                projectId={project.projectId}
                projectMemberships={projectMemberships}
                addProjectMembership={addProjectMembership}
                deleteProjectMembership={deleteProjectMembership}
            />
            <p /><hr /><p />
            <ProjectUsageView
                projectId={project.projectId}
            />
            <p /><hr /><p />
            <Hyperlink onClick={handleTestTaskBackend}>Test task backend</Hyperlink>
            <p /><hr /><p />
        </div>
    )
}

export default ProjectPage