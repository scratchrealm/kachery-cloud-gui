const getDefaultBucketId = () => {
    const ret = process.env['DEFAULT_BUCKET_ID']
    if (!ret) {
        throw Error(`Environment variable not set: DEFAULT_BUCKET_ID`)
    }
    return ret
}

export default getDefaultBucketId