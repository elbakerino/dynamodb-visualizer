import {
    FlowState, FlowStateDataScopes,
    FlowStateView, FlowViewListEntryNode,
} from '../FlowTypes'

export const makeView = <FSD extends FlowStateDataScopes, FV extends FlowStateView, FS extends FlowState<FSD, FV> = FlowState<FSD, FV>, K extends keyof FSD = keyof FSD, ID extends keyof FS['view'][K] = keyof FS['view'][K]>(
    dataScope: K,
    id: ID,
    view: Partial<FlowStateView>,
    data: FS['data'],
): FlowViewListEntryNode<FSD, FV> => {
    // todo: actually `view` would be the combined flow state view, not the prebuild OR both
    const {position, ...v} = view
    const idExist = typeof id !== 'undefined' && id !== null && id !== ''
    if(!idExist) {
        console.log('No ID for updating flow state in scope `' + dataScope + '`', view)
    }
    return {
        id: id,
        position: position,
        // todo: move this to another function, pass down spreadable object
        ...(data[dataScope] && data[dataScope][id]?.type ? {
            type: data[dataScope][id].type,
        } : {}),
        ...(data[dataScope] && data[dataScope][id]?.data ? {
            data: {
                _data: data[dataScope][id].data,
                _view: v,
            },
        } : {
            data: {
                _view: v,
            },
        }),
        // for edge:
        //label: ''
    } as FlowViewListEntryNode<FSD, FV>
}
