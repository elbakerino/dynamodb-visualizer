import { FlowState, FlowStateDataScopes, FlowStateView } from './FlowTypes'

export interface FlowLayer {
    id: string
    type: string
}

export interface FlowLayerList {
    layers: FlowLayer[]
}

export const buildLayerList = <FSD extends FlowStateDataScopes, FV extends FlowStateView = FlowStateView, FS extends FlowState<FSD, FV> = FlowState<FSD, FV>>(viewList: FS['viewList']) => {
    const layerList: FlowLayerList = {
        layers: []
    }

    viewList?.forEach(vi => {
        if('source' in vi || 'target' in vi) {
            // ignoring connections in the layer list,
            // as always in separate background layer
            return
        }
        layerList.layers.push({
            id: vi.id,
            type: vi.type as string,
        })
    })

    return layerList
}
