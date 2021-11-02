import { FlowConnection, FlowState, FlowStateDataScopes, FlowStateType, FlowStateView } from '../FlowTypes'
import { Connection, Edge } from 'react-flow-renderer'

export const updateConnection = <FSD extends FlowStateDataScopes, FV extends FlowStateView, FS extends FlowState<FSD, FV> = FlowState<FSD, FV>>(
    fs: FlowStateType<FSD, FV>,
    edge: Edge,
    newConnection: Connection
): FlowStateType<FSD, FV> => {
    fs = fs.update('connections', (data) => {
        const connections = [...(data as FS['connections'])]
        const con = connections.findIndex(c => c.id === edge.id)
        if(con !== -1) {
            connections.splice(con, 1, {
                ...newConnection,
                id: edge.id,
            } as FlowConnection)
        }
        return connections
    })

    fs = fs.update('viewList', (viewList) => {
        viewList = [...(viewList as FS['viewList'] || [])] as FS['viewList']
        const con = viewList.findIndex(c => c.id === edge.id)
        if(con !== -1) {
            viewList.splice(con, 1, {
                ...newConnection,
                id: edge.id,
            } as FlowConnection)
        }
        return viewList
    })

    return fs
}
