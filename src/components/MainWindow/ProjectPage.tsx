import { Table, TableBody, TableCell, TableRow } from '@material-ui/core';
import guiApiRequest from 'common/guiApiRequest';
import Hyperlink from 'commonComponents/Hyperlink/Hyperlink';
import { useSignedIn } from 'components/googleSignIn/GoogleSignIn';
import useRoute from 'components/useRoute';
import useErrorMessage from 'errorMessageContext/useErrorMessage';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { SetProjectInfoRequest } from 'types/GuiRequest';
import EditableTextField from './EditableTextField';
import ProjectMembershipsTable from './ProjectMembershipsTable';
import ProjectSettingsView from './ProjectSettingsView';
import ProjectUsageView from './ProjectUsageView';
import useProjectMemberships from './useProjectMemberships';
import useProjects from './useProjects';

type Props = {
    projectId: string
}

const ProjectPage: FunctionComponent<Props> = ({projectId}) => {
    const { projects, setProjectSettings, refreshProjects } = useProjects()
    const { projectMemberships, addProjectMembership, deleteProjectMembership } = useProjectMemberships()
    const { setRoute } = useRoute()

    const project = useMemo(() => (
        (projects || []).filter(project => (project.projectId === projectId))[0]
    ), [projects, projectId])

    const projectMembershipsForProject = useMemo(() => (
        project ? (
            (projectMemberships || []).filter(cn => (cn.projectId === project.projectId))
        ) : undefined
    ), [projectMemberships, project])

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
            refreshProjects()
        })()
    }, [userId, googleIdToken, projectId, refreshProjects, setErrorMessage])

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
            { key: 'timestampCreated', label: 'Created', value: `${new Date(project.timestampCreated)}` },
            { key: 'timestampLastModified', label: 'Modified', value: `${new Date(project.timestampLastModified)}` }
        ]
    }, [project, handleChangeLabel])

    const handleBack = useCallback(() => {
        setRoute({page: 'home'})
    }, [setRoute])

    const handleTestTaskBackend = useCallback(() => {
        setRoute({page: 'testTaskBackend', projectId})
    }, [setRoute, projectId])

    if (!projects) {
        return <span>Loading...</span>
    }

    if (!projectMemberships) {
        return <span>Loading...</span>
    }

    if (!project) {
        return <span>Project not found: {projectId}</span>
    }

    if (!projectMembershipsForProject) {
        return <span>Unexpected, no projectMembershipsForProject</span>
    }


    if (!tableData) return <div />
    return (
        <div>
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
            <ProjectSettingsView
                projectId={project.projectId}
                projectSettings={project.settings}
                setProjectSettings={setProjectSettings}
            />
            <ProjectMembershipsTable
                projectId={project.projectId}
                projectMemberships={projectMemberships}
                addProjectMembership={addProjectMembership}
                deleteProjectMembership={deleteProjectMembership}
            />
            <ProjectUsageView
                projectId={project.projectId}
            />
            <div>&nbsp;</div>
            <Hyperlink onClick={handleTestTaskBackend}>Test task backend</Hyperlink>
        </div>
    )
}

export default ProjectPage