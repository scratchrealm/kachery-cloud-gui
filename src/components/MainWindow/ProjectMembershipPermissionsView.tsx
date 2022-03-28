import React, { FunctionComponent } from 'react';
import { ProjectMembership } from 'types/ProjectMembership';

type Props = {
    projectMembership: ProjectMembership
}

const ChannelNodePermissionsView: FunctionComponent<Props> = ({projectMembership}) => {
    return (
        <div>
            <pre>{JSON.stringify(projectMembership.permissions)}</pre>
        </div>
    )
}

export default ChannelNodePermissionsView