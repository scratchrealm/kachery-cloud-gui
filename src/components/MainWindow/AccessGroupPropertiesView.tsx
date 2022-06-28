import Hyperlink from 'components/Hyperlink/Hyperlink';
import { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { AccessGroup, AccessGroupUser } from 'types/AccessGroup';
import EditAccessGroupProperties from './EditAccessGroupProperties';

type Props = {
    accessGroup: AccessGroup
    setAccessGroupProperties?: (o: {label?: string, publicRead?: boolean, publicWrite?: boolean, users?: AccessGroupUser[]}) => Promise<void>
}

const AccessGroupPropertiesView: FunctionComponent<Props> = ({accessGroup, setAccessGroupProperties}) => {
    const [editing, setEditing] = useState<boolean>(false)
    const handleSetAccessGroupProperties = useCallback((o: {label?: string, publicRead?: boolean, publicWrite?: boolean, users?: AccessGroupUser[]}) => {
        if (!setAccessGroupProperties) return
        const {label, publicRead, publicWrite, users} = o
        setAccessGroupProperties({label, publicRead, publicWrite, users})
        setEditing(false)
    }, [setAccessGroupProperties])
    return (
        <div>
            <h3>Access group properties</h3>
            {
                setAccessGroupProperties ? (
                    editing ? (
                        <EditAccessGroupProperties
                            accessGroup={accessGroup}
                            setAccessGroupProperties={handleSetAccessGroupProperties}
                            onCancel={() => {setEditing(false)}}
                        />
                    ) : (
                        <div>
                            <pre>{JSON.stringify(accessGroup)}</pre>
                            <Hyperlink onClick={() => setEditing(true)}>edit</Hyperlink>
                        </div>
                    )
                ) : (
                    <pre>{JSON.stringify(accessGroup)}</pre>
                )
            }
        </div>
    )
}

export default AccessGroupPropertiesView