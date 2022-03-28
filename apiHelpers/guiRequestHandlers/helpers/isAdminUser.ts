import { UserId } from "../../../src/commonInterface/kacheryTypes"

const adminUsersJson = process.env.REACT_APP_ADMIN_USERS || "[]"
const adminUsers = JSON.parse(adminUsersJson) as any as string[]

const isAdminUser = (userId: UserId) => {
    return adminUsers.includes(userId.toString())
}

export default isAdminUser