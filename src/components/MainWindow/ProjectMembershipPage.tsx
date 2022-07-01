import { Table, TableBody, TableCell, TableRow } from '@material-ui/core';
import Hyperlink from 'commonComponents/Hyperlink/Hyperlink';
import { UserId } from 'commonInterface/kacheryTypes';
import useRoute from 'components/useRoute';
import React, { FunctionComponent, useMemo } from 'react';
import { ProjectMembership, ProjectMembershipPermissions } from 'types/ProjectMembership';
import ProjectMembershipPermissionsView from './ProjectMembershipPermissionsView';
import useProject from './useProject';

type Props = {
    projectId: string
    memberId: UserId
}

const ProjectMembershipPage: FunctionComponent<Props> = ({projectId, memberId}) => {
    const { projectMemberships, setProjectMembershipPermissions } = useProject(projectId)
    const { setRoute } = useRoute()

    const projectMembership: ProjectMembership | undefined = useMemo(() => (
        projectMemberships ? projectMemberships.filter(n => (n.memberId === memberId))[0] : undefined
    ), [projectMemberships, memberId])

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
                label: 'Member',
                value: <Hyperlink onClick={() => {setRoute({page: 'user', userId: projectMembership.memberId})}}>{projectMembership.memberId.toString()}</Hyperlink>
            }
        ]
    }, [projectMembership, setRoute])

    if (!projectMemberships) {
        return <span>Loading...</span>
    }

    if (!projectMembership) {
        return <span>Project membership not found: {projectId} {memberId}</span>
    }

    if (!tableData) return <div />
    return (
        <div>
            <h3>Project membership</h3>
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
            <p /><hr /><p />
            <ProjectMembershipPermissionsView
                projectMembership={projectMembership}
                setProjectMembershipPermissions={(p: ProjectMembershipPermissions) => setProjectMembershipPermissions({memberId, projectMembershipPermissions: p})}
            />
            <p /><hr /><p />
        </div>
    )
}

export default ProjectMembershipPage