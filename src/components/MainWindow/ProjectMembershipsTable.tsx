import { IconButton } from '@material-ui/core';
import { AddCircle } from '@material-ui/icons';
import Hyperlink from 'commonComponents/Hyperlink/Hyperlink';
import NiceTable from 'commonComponents/NiceTable/NiceTable';
import useVisible from 'commonComponents/useVisible';
import { isUserId, UserId } from 'commonInterface/kacheryTypes';
import useRoute from 'components/useRoute';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { ProjectMembership } from 'types/ProjectMembership';
import AddProjectMembershipControl from './AddProjectMembershipControl';
import ProjectMembershipPermissionsView from './ProjectMembershipPermissionsView';

type Props = {
    projectId: string
    projectMemberships: ProjectMembership[]
    addProjectMembership: (memberId: UserId) => void
    deleteProjectMembership: (memberId: UserId) => void
}

const ProjectMembershipsTable: FunctionComponent<Props> = ({projectId, projectMemberships, addProjectMembership, deleteProjectMembership}) => {
    const addVisible = useVisible()
    const { setRoute } = useRoute()

    const columns = useMemo(() => ([
        {
            key: 'memberId',
            label: 'Member ID'
        },
        {
            key: 'permissions',
            label: 'Permissions'
        }
    ]), [])

    const rows = useMemo(() => (
        projectMemberships.map((projectMembership) => ({
            key: projectMembership.memberId.toString(),
            columnValues: {
                memberId: {
                    text: projectMembership.memberId,
                    element: <Hyperlink onClick={() => {setRoute({page: 'projectMembership', projectId: projectMembership.projectId, memberId: projectMembership.memberId})}}>{projectMembership.memberId}</Hyperlink>
                },
                permissions: {
                    text: '',
                    element: <ProjectMembershipPermissionsView projectMembership={projectMembership} />
                }
            }
        }))
    ), [projectMemberships, setRoute])

    const handleDeleteProjectMembership = useCallback((memberId: string) => {
        if (!isUserId(memberId)) return
        deleteProjectMembership(memberId)
    }, [deleteProjectMembership])

    return (
        <div>
            <h3>Project members</h3>
            <IconButton onClick={addVisible.show} title="Add project member"><AddCircle /></IconButton>
            {
                addVisible.visible && (
                    <AddProjectMembershipControl
                        projectId={projectId}
                        onAdd={addProjectMembership}
                        onClose={addVisible.hide}
                    />
                )
            }
            <NiceTable
                columns={columns}
                rows={rows}
                onDeleteRow={handleDeleteProjectMembership}
            />
        </div>
    )
}

export default ProjectMembershipsTable