import { FunctionComponent } from "react";
import { AccessGroup, AccessGroupUser } from "types/AccessGroup";

type Props = {
    accessGroup: AccessGroup
    setAccessGroupProperties?: (o: {label?: string, publicRead?: boolean, publicWrite?: boolean, users?: AccessGroupUser[]}) => void
    onCancel: () => void
}

const EditAccessGroupProperties: FunctionComponent<Props> = ({accessGroup, setAccessGroupProperties, onCancel}) => {
    return <div>TODO</div>
}

export default EditAccessGroupProperties