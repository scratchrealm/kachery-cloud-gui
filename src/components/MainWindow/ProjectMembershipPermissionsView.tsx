import { Button, Checkbox } from '@material-ui/core';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { ProjectMembership, ProjectMembershipPermissions } from 'types/ProjectMembership';

type Props = {
    projectMembership: ProjectMembership
    setProjectMembershipPermissions?: (projectMembershipPermissions: ProjectMembershipPermissions) => void
}

const ChannelNodePermissionsView: FunctionComponent<Props> = ({projectMembership, setProjectMembershipPermissions}) => {
    const [editing, setEditing] = useState<boolean>(false)
    const [internalPermissions, setInternalPermissions] = useState<ProjectMembershipPermissions | undefined>(undefined)
    useEffect(() => {
        if (!editing) {
            setInternalPermissions({
                ...projectMembership.permissions
            })
        }
    }, [editing, projectMembership.permissions])
    const handleSet = useCallback(() => {
        if (!setProjectMembershipPermissions) return
        if (!internalPermissions) return
        setProjectMembershipPermissions(internalPermissions)
        setEditing(false)
    }, [setProjectMembershipPermissions, internalPermissions])
    return (
        <div>
            {
                internalPermissions ? (
                    <div>
                        {
                            setProjectMembershipPermissions && (
                                editing ? (
                                    <span>
                                        <div style={{color: 'red'}}>
                                            Click the save button for changes to take effect.
                                        </div>
                                        <div>
                                            <Button onClick={handleSet}>Save</Button>
                                            <Button onClick={() => {setEditing(false)}}>Cancel</Button>
                                        </div>
                                    </span>
                                ) : (
                                    <span>
                                        <Button onClick={() => {setEditing(true)}}>Edit</Button>
                                    </span>
                                )
                            )
                        }
                        <div>
                            <Checkbox
                                checked={internalPermissions.read}
                                disabled={(!editing) || (!setProjectMembershipPermissions)}
                                onClick={() => {
                                    setInternalPermissions({
                                        ...internalPermissions,
                                        read: !internalPermissions.read
                                    })
                                }}
                            /> Read
                            &nbsp;
                            <Checkbox
                                checked={internalPermissions.write}
                                disabled={(!editing) || (!setProjectMembershipPermissions)}
                                onClick={() => {
                                    setInternalPermissions({
                                        ...internalPermissions,
                                        write: !internalPermissions.write
                                    })
                                }}
                            /> Write
                        </div>
                    </div>
                ) : <div>Loading...</div>
            }
        </div>
    )
}

export default ChannelNodePermissionsView