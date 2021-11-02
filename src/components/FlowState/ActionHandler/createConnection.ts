import { FlowConnection, FlowState, FlowStateDataScopes, FlowStateType, FlowStateView } from '../FlowTypes'
import { Connection, Edge } from 'react-flow-renderer'
import { FlowRendererProps } from '../FlowRenderer'
import { genId } from '../../../lib/genId'

export const createConnection = <FSD extends FlowStateDataScopes, FV extends FlowStateView, FS extends FlowState<FSD, FV> = FlowState<FSD, FV>>(
    fs: FlowStateType<FSD, FV>,
    connection: Edge | Connection,
    getEdgeType?: FlowRendererProps<FSD, FV>['getEdgeType']
): FlowStateType<FSD, FV> => {
    const newId = genId(8)
    const newType = getEdgeType && getEdgeType(connection)
    const newTypeObj = newType ? {type: newType} : {}

    const newConnection = {
        ...connection as FlowConnection,
        id: newId,
        ...newTypeObj,
        data: {
            ...newTypeObj,
        }
        //...((data as FlowState<FSD, FV>['data'])[initialType] || {}),
    }
    fs = fs.update('connections', (data) => ([
        ...(data as FS['connections']),
        newConnection,
    ]))

    fs = fs.update('viewList', (viewList) => {
        viewList = [...(viewList as FS['viewList'] || [])] as FS['viewList']
        (viewList as FS['viewList']).push(newConnection as FlowConnection)

        return viewList
    })

    return fs
}
