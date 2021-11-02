import { FlowState, FlowStateDataScopes, FlowStateType, FlowStateView } from '../FlowTypes'
import { makeView } from './makeView'

export const updateNodeData = <FSD extends FlowStateDataScopes, FV extends FlowStateView, FS extends FlowState<FSD, FV> = FlowState<FSD, FV>, FST extends FlowStateType<FSD, FV, FS> = FlowStateType<FSD, FV, FS>, K extends keyof FSD = keyof FSD>(
    fs: FST,
    dataScope: K,
    id: string,
    updater: (data: FSD[K]) => FSD[K],
): FST => {
    fs = fs.update('data', (data) => {
        const d = {...data} as FS['data']
        d[dataScope] = {...d[dataScope] || {}}
        // @ts-ignore
        d[dataScope][id] = {
            ...d[dataScope][id],
            // @ts-ignore
            data: updater(d[dataScope][id].data || {}),
        }
        return d
    })

    fs = fs.update('viewList', viewList => {
        const vl = [...(viewList as FS['viewList']) || []] as FS['viewList']
        const index = vl.findIndex(vi => vi.id === id)
        const view = fs.get('view') as FS['view']
        if(view && view[dataScope][id] && index !== -1) {
            // todo: make this build the same as for the `view`/`viewList` update in the `createNode` function, but without cleaning
            // @ts-ignore
            const {data, ...oldViewListCleaned} = (vl[index] && vl[index] ? vl[index] : {})
            vl.splice(
                index, 1,
                makeView<FSD, FV, FS>(
                    dataScope,
                    id,
                    {
                        ...oldViewListCleaned,
                        // @ts-ignore
                        ...vl[index] && vl[index].data?._view ? vl[index].data._view : view[dataScope][id],
                    },
                    fs.get('data') as FS['data']
                )
            )
        }

        return vl
    })
    return fs
}
