import { FlowState, FlowStateDataScopes, FlowStateType, FlowStateView, FlowStateViewCombined } from '../FlowTypes'
import { makeView } from './makeView'
import { FlowLayerList } from '../buildLayerList'

export const buildViewList = <FSD extends FlowStateDataScopes, FV extends FlowStateView>(
    layerList: FlowLayerList | undefined,
    fs: FlowStateType<FSD>
) => {
    const viewDataScopes = Object.keys(fs.get('view') as FlowState<FSD, FV>['view'] || {}) as (keyof FSD)[]
    const data = fs.get('data') as FlowState<FSD, FV>['data']
    const views = fs.get('view') as FlowState<FSD, FV>['view']
    const connections = fs.get('connections') as FlowState<FSD, FV>['connections']
    const lists = []
    if(layerList) {
        lists.push(
            ...layerList.layers.map(layer => {
                const view = views[layer.type][layer.id] as Partial<FlowStateViewCombined<FV>>
                return makeView<FSD, FV>(layer.type, layer.id, view, data)
            })
        )
    } else {
        lists.push(
            ...viewDataScopes.map(viewScope =>
                Object.keys(views[viewScope]).map(viewKey => {
                    const view = views[viewScope][viewKey] as Partial<FlowStateViewCombined<FV>>
                    return makeView<FSD, FV>(viewScope, viewKey, view, data)
                })
            )
        )
    }
    lists.push(connections)
    fs = fs.set(
        'viewList',
        // @ts-ignore
        lists.reduce((list, views = []) => [
            // @ts-ignore
            ...list,
            // @ts-ignore
            ...views,
        ], []) as FlowState<FSD, FV>['viewList']
    )
    return fs
}

