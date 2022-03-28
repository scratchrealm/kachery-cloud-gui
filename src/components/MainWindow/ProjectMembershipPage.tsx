import { Table, TableBody, TableCell, TableRow } from '@material-ui/core';
import Hyperlink from 'commonComponents/Hyperlink/Hyperlink';
import { UserId } from 'commonInterface/kacheryTypes';
import useRoute from 'components/useRoute';
import React, { FunctionComponent, useMemo } from 'react';
import { ProjectMembership } from 'types/ProjectMembership';
import ProjectMembershipPermissionsView from './ProjectMembershipPermissionsView';
import useProjectMemberships from './useProjectMemberships';

type Props = {
    projectId: string
    memberId: UserId
}

const ProjectMembershipPage: FunctionComponent<Props> = ({projectId, memberId}) => {
    const { projectMemberships } = useProjectMemberships()
    const { setRoute } = useRoute()

    const projectMembership: ProjectMembership | undefined = useMemo(() => (
        projectMemberships ? projectMemberships.filter(n => (n.projectId === projectId) && (n.memberId === memberId))[0] : undefined
    ), [projectMemberships, projectId, memberId])

    const tableData = useMemo(() => {
        if (!projectMembership) return undefined
        return [
            {
                key: 'projectId',
                label: 'Project',
                value: <Hyperlink onClick={() => {setRoute({page: 'project', projectId: projectMembership.projectId})}}>{projectMembership.projectId.toString()}</Hyperlink>
            },
            {
                key: 'memberId',
                label: 'Node',
                value: <Hyperlink onClick={() => {setRoute({page: 'user', userId: projectMembership.memberId})}}>{projectMembership.memberId.toString()}</Hyperlink>
            },
            {
                key: 'permissions',
                label: 'Permissions',
                value: <ProjectMembershipPermissionsView projectMembership={projectMembership} />
            }
        ]
    }, [projectMembership, setRoute])

    if (!projectMemberships) {
        return <span>Loading...</span>
    }

    if (!projectMembership) {
        return <span>Project node not found: {projectId} {memberId}</span>
    }

    if (!tableData) return <div />
    return (
        <div>
            <h3>Project node</h3>
            <Table className="NiceTable2">
                <TableBody>
                    {
                        tableData.map(x => (
                            <TableRow key={x.key}>
                                <TableCell>{x.label}: </TableCell>
                                <TableCell>{x.value}</TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        </div>
    )
}

export default ProjectMembershipPage