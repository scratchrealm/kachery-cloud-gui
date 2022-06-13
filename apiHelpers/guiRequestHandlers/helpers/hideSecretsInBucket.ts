import { Bucket } from "../../../src/types/Bucket";

const hideSecretsInBucket = (x: Bucket) => {
    x.credentials = x.credentials ? '*' : ''
}

export default hideSecretsInBucket