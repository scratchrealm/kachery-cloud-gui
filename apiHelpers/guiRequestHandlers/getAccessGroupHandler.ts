import { UserId } from "../../src/commonInterface/kacheryTypes";
import { GetAccessGroupRequest, GetAccessGroupResponse } from "../../src/types/GuiRequest";
import { getAccessGroup } from "../common/getDatabaseItems";
import isAdminUser from "./helpers/isAdminUser";

const getAccessGroupHandler = async (request: GetAccessGroupRequest, verifiedUserId?: UserId): Promise<GetAccessGroupResponse> => {
    const { accessGroupId } = request

    const accessGroup = await getAccessGroup(accessGroupId)

    if (accessGroup.ownerId !== verifiedUserId) {
        if (!isAdminUser(verifiedUserId)) {
            throw Error('Not owner of access group and not admin user.')
        }
    }

    return {
        type: 'getAccessGroup',
        accessGroup
    }
}

export default getAccessGroupHandler