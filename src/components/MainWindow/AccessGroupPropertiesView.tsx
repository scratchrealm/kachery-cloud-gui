import { Button, Checkbox } from '@material-ui/core';
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { AccessGroup, AccessGroupUser } from 'types/AccessGroup';
import AccessGroupUsersTable from './AccessGroupUsersTable';

export type EditedAccessGroupProperties = {
    publicRead: boolean
    publicWrite: boolean
    users: AccessGroupUser[]
}

type Props = {
    accessGroup: AccessGroup
    setAccessGroupProperties?: (properties: EditedAccessGroupProperties) => Promise<void>
}

const AccessGroupPropertiesView: FunctionComponent<Props> = ({accessGroup, setAccessGroupProperties}) => {
    const [editing, setEditing] = useState<boolean>(false)
    const [internalProperties, setInternalProperties] = useState<EditedAccessGroupProperties | undefined>(undefined)
    useEffect(() => {
        if (!editing) {
            setInternalProperties({
                publicRead: accessGroup.publicRead,
                publicWrite: accessGroup.publicWrite,
                users: [...accessGroup.users]
            })
        }
    }, [editing, accessGroup])
    const handleSet = useCallback(() => {
        if (!setAccessGroupProperties) return
        if (!internalProperties) return
        setAccessGroupProperties(internalProperties)
        setEditing(false)
    }, [setAccessGroupProperties, internalProperties])
    return (
        <div>
            {
                internalProperties ? (
                    <div>
                        {
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
                        }
                        <div>
                            <Checkbox
                                checked={internalProperties.publicRead}
                                disabled={!editing}
                                onClick={() => {
                                    setInternalProperties({
                                        ...internalProperties,
                                        publicRead: !internalProperties.publicRead
                                    })
                                }}
                            /> Public Read
                        </div>
                        <div>
                            <Checkbox
                                checked={internalProperties.publicWrite}
                                disabled={!editing}
                                onClick={() => {
                                    setInternalProperties({
                                        ...internalProperties,
                                        publicWrite: !internalProperties.publicWrite
                                    })
                                }}
                            /> Public Write
                        </div>
                        <div>
                            <AccessGroupUsersTable
                                accessGroupUsers={internalProperties.users}
                                setAccessGroupUsers={(users: AccessGroupUser[]) => {setInternalProperties({...internalProperties, users})}}
                                readonly={!editing}
                            />
                        </div>
                    </div>
                ) : <div>Loading...</div>
            }
        </div>
    )
}

export default AccessGroupPropertiesView