import { FlowState, FlowStateDataScopes, FlowStateType, FlowStateView, FlowStateViewCombined, FlowViewListEntryNode } from '../FlowTypes'
import { makeView } from './makeView'

export const updateNodeView = <FSD extends FlowStateDataScopes, FV extends FlowStateView, FS extends FlowState<FSD, FV> = FlowState<FSD, FV>, FST extends FlowStateType<FSD, FV, FS> = FlowStateType<FSD, FV, FS>, K extends keyof FSD = keyof FSD, ID extends keyof FS['view'][K] = keyof FS['view'][K], D extends FS['view'][K][ID] = FS['view'][K][ID]>(
    fs: FST,
    dataScope: K,
    id: ID,
    updater: (data: D) => D,
): FST => {
    let currentView = fs.get('view') as FS['view']
    currentView[dataScope] = {...currentView[dataScope]}
    currentView[dataScope][id] = {...currentView[dataScope][id]}
    const currentViewItem = currentView[dataScope][id]
    const updated = updater(currentViewItem as D)
    currentView[dataScope][id] = updated
    fs = fs.set('view', currentView)

    fs = fs.update('viewList', viewList => {
        const vl: FS['viewList'] = [...(viewList as FS['viewList']) || []]
        const index = vl.findIndex(vi => vi.id === id)
        const view = fs.get('view') as FS['view']
        if(view && view[dataScope][id] && index !== -1) {
            // todo: make this build the same as for the `view`/`viewList` update in the `createNode` function
            // @ts-ignore
            const {data, ...oldViewListCleaned} = (vl[index] && vl[index] ? vl[index] : {})
            // @ts-ignore
            const {id: idT, type: typeT, ...p} = updated
            const vli = vl[index] as FlowViewListEntryNode<FSD, FV>
            vl.splice(
                index, 1,
                makeView<FSD, FV, FS>(
                    dataScope,
                    id as string,
                    {
                        ...oldViewListCleaned,
                        ...('data' in vli ? {
                            ...vli && vli.data?._view ? vli.data._view : view[dataScope][id],
                        } : {}),
                        ...p,
                        // todo check typing
                    } as unknown as Partial<FlowStateViewCombined<FV>>,
                    fs.get('data') as FS['data']
                )
            )
        }

        return vl
    })
    return fs
}
