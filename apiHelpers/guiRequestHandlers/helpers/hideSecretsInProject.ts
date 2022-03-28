import { Project } from "../../../src/types/Project";

const hideSecretsInProject = (x: Project) => {
    if (x.settings.ipfsUploadGateway?.authenticationToken) {
        x.settings.ipfsUploadGateway.authenticationToken = null
    }
}

export default hideSecretsInProject