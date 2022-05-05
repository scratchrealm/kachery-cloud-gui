import { IconButton } from '@material-ui/core';
import { AddCircle, Refresh } from '@material-ui/icons';
import Hyperlink from 'commonComponents/Hyperlink/Hyperlink';
import NiceTable from 'commonComponents/NiceTable/NiceTable';
import useVisible from 'commonComponents/useVisible';
import useRoute from 'components/useRoute';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import AddProjectControl from './AddProjectControl';
import useProjectMembershipsForUser from './useProjectMembershipsForUser';
import useProjects from './useProjectsForUser';

type Props = {
}

const ProjectsTable: FunctionComponent<Props> = () => {
    const addVisible = useVisible()

    const {setRoute} = useRoute()

    const { projects, refreshProjects, addProject, deleteProject } = useProjects()
    const { projectMemberships } = useProjectMembershipsForUser()

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
            key: 'numNodes',
            label: 'Num. nodes'
        }
    ]), [])

    const rows = useMemo(() => (
        (projects || []).map((project) => ({
            key: project.projectId.toString(),
            columnValues: {
                project: {
                    text: project.projectId,
                    element: (
                        <Hyperlink onClick={() => {setRoute({page: 'project', projectId: project.projectId})}}>
                            {project.projectId}
                        </Hyperlink>
                    )
                },
                label: {
                    text: project.label,
                    element: (
                        <Hyperlink onClick={() => {setRoute({page: 'project', projectId: project.projectId})}}>
                            {project.label}
                        </Hyperlink>
                    )
                },
                ownerId: project.ownerId.toString(),
                timestampCreated: timeSince(project.timestampCreated),
                timestampLastModified: timeSince(project.timestampLastModified),
                numNodes: `${(projectMemberships || []).filter(cn => (cn.projectId === project.projectId)).length}`
            }
        }))
    ), [projects, projectMemberships, setRoute])

    const handleDeleteProject = useCallback((projectId: string) => {
        deleteProject(projectId)
    }, [deleteProject])

    return (
        <div>
            <h3>Projects</h3>
            <p>Kachery cloud resources are organized into projects.</p>
            <IconButton onClick={refreshProjects} title="Refresh projects"><Refresh /></IconButton>
            <IconButton onClick={addVisible.show} title="Add project"><AddCircle /></IconButton>
            {
                addVisible.visible && (
                    <AddProjectControl
                        onAdd={addProject}
                        onClose={addVisible.hide}
                    />
                )
            }
            <NiceTable
                columns={columns}
                rows={rows}
                onDeleteRow={handleDeleteProject}
            />
            {
                !projects ? (
                    <div>Loading projects...</div>
                ) : <span />
            }
        </div>
    )
}

// thanks https://stackoverflow.com/questions/3177836/how-to-format-time-since-xxx-e-g-4-minutes-ago-similar-to-stack-exchange-site
export function timeSince(date: number) {
    var seconds = Math.floor((Date.now() - date) / 1000);

    var interval = seconds / 31536000;

    if (interval > 1) {
        return Math.floor(interval) + " years";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        return Math.floor(interval) + " months";
    }
    interval = seconds / 86400;
    if (interval > 1) {
        return Math.floor(interval) + " days";
    }
    interval = seconds / 3600;
    if (interval > 1) {
        return Math.floor(interval) + " hours";
    }
    interval = seconds / 60;
    if (interval > 1) {
        return Math.floor(interval) + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}

export default ProjectsTable