import { Checkbox, IconButton } from '@material-ui/core';
import { AddCircle } from '@material-ui/icons';
import NiceTable from 'commonComponents/NiceTable/NiceTable';
import useVisible from 'commonComponents/useVisible';
import { FunctionComponent, useCallback, useMemo } from 'react';
import { AccessGroupUser } from 'types/AccessGroup';
import AddAccessGroupUserControl from './AddAccessGroupUserControl';

type Props = {
    accessGroupUsers: AccessGroupUser[]
    setAccessGroupUsers: (users: AccessGroupUser[]) => void
    readonly: boolean
}

const AccessGroupUsersTable: FunctionComponent<Props> = ({accessGroupUsers, setAccessGroupUsers, readonly}) => {
    const addVisible = useVisible()

    const columns = useMemo(() => ([
        {
            key: 'userId',
            label: 'User ID'
        },
        {
            key: 'read',
            label: 'Read'
        },
        {
            key: 'write',
            label: 'Write'
        }
    ]), [])

    const rows = useMemo(() => (
        (accessGroupUsers || []).map((user) => ({
            key: user.userId,
            columnValues: {
                userId: {
                    text: user.userId
                },
                read: {
                    text: user.read ? 'YES' : 'NO',
                    element: (
                        <Checkbox
                            checked={user.read}
                            disabled={readonly}
                            onClick={() => {
                                const a = [...accessGroupUsers.map(u => ({...u}))]
                                for (let u of a) {
                                    if (u.userId === user.userId) u.read = !u.read
                                }
                                setAccessGroupUsers(a)
                            }}
                        />
                    )
                },
                write: {
                    text: user.write ? 'YES' : 'NO',
                    element: (
                        <Checkbox
                            checked={user.write}
                            disabled={readonly}
                            onClick={() => {
                                const a = [...accessGroupUsers.map(u => ({...u}))]
                                for (let u of a) {
                                    if (u.userId === user.userId) u.write = !u.write
                                }
                                setAccessGroupUsers(a)
                            }}
                        />
                    )
                }
            }
        }))
    ), [accessGroupUsers, readonly, setAccessGroupUsers])

    const handleDeleteAccessGroupUser = useCallback((userId: string) => {
        setAccessGroupUsers(
            accessGroupUsers.filter(user => (user.userId !== userId))
        )
    }, [setAccessGroupUsers, accessGroupUsers])

    const handleAddAccessGroupUser = useCallback((userId: string) => {
        setAccessGroupUsers(
            [...accessGroupUsers, {userId, read: false, write: false}]
        )
    }, [setAccessGroupUsers, accessGroupUsers])

    return (
        <div>
            {
                !readonly && <IconButton onClick={addVisible.show} title="Add user"><AddCircle /></IconButton>
            }
            {
                (addVisible.visible) && (!readonly) && (
                    <AddAccessGroupUserControl
                        onAdd={handleAddAccessGroupUser}
                        onClose={addVisible.hide}
                    />
                )
            }
            <NiceTable
                columns={columns}
                rows={rows}
                onDeleteRow={!readonly ? handleDeleteAccessGroupUser : undefined}
            />
        </div>
    )
}

export default AccessGroupUsersTable