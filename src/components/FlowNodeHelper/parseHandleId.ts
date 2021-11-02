export const parseHandleId = (handleId: string | null | undefined): {
    action: string
    type: string
    index: number
} | undefined => {
    if(!handleId) return undefined
    if(handleId.indexOf('__') === -1) {
        console.log('invalid handleId found, missing `__` action separator', handleId)
        return undefined
    }

    const [handleContainer, handleAction] = handleId.split('__') as [string, string]
    if(handleContainer.indexOf('-') === -1) {
        console.log('invalid handleId found, missing `-` index separator', handleId)
        return undefined
    }
    const [handleType, handleIndexStr] = handleContainer.split('-')
    const handleIndex = Number(handleIndexStr)
    return {
        action: handleAction,
        type: handleType,
        index: handleIndex
    }
}
