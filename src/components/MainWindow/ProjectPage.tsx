import { Table, TableBody, TableCell, TableRow } from '@material-ui/core';
import Hyperlink from 'commonComponents/Hyperlink/Hyperlink';
import useRoute from 'components/useRoute';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import ProjectMembershipsTable from './ProjectMembershipsTable';
import ProjectSettingsView from './ProjectSettingsView';
import useProjectMemberships from './useProjectMemberships';
import useProjects from './useProjects';

type Props = {
    projectId: string
}

const ProjectPage: FunctionComponent<Props> = ({projectId}) => {
    const { projects, setProjectSettings } = useProjects()
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

    const tableData = useMemo(() => {
        if (!project) return undefined
        return [
            { key: 'projectId', label: 'Project', value: project.projectId.toString() },
            { key: 'ownerId', label: 'Owner', value: project.ownerId.toString() },
            { key: 'timestampCreated', label: 'Created', value: `${new Date(project.timestampCreated)}` },
            { key: 'timestampLastModified', label: 'Modified', value: `${new Date(project.timestampLastModified)}` }
        ]
    }, [project])

    const handleBack = useCallback(() => {
        setRoute({page: 'home'})
    }, [setRoute])

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
        </div>
    )
}

export default ProjectPage