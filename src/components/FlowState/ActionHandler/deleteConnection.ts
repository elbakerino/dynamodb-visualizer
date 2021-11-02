import { FlowState, FlowStateDataScopes, FlowStateType, FlowStateView } from '../FlowTypes'

export const deleteConnectionById = <FSD extends FlowStateDataScopes, FV extends FlowStateView = FlowStateView>(
    fs: FlowStateType<FSD, FV>,
    id: string,
): FlowStateType<FSD, FV> => {
    let didDelete = false
    fs = fs.update('connections', (connections) => {
        connections = [...(connections as FlowState<FSD, FV>['connections']) || []]
        const index = connections.findIndex(c => c.id === id)
        if(index !== -1) {
            connections.splice(index, 1)
            didDelete = true
        }
        return connections
    })

    if(didDelete) {
        fs = fs.update('viewList', viewList => {
            viewList = [...(viewList as FlowState<FSD, FV>['viewList'] || [])] as FlowState<FSD, FV>['viewList']
            const index = viewList.findIndex(vi => vi.id === id)
            if(index !== -1) {
                viewList.splice(index, 1)
            }
            return viewList
        })
    }
    return fs
}
