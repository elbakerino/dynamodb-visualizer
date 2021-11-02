import { FlowState, FlowStateDataScopes, FlowStateType, FlowStateView } from '../FlowTypes'

export const switchNodeType = <FSD extends FlowStateDataScopes, FV extends FlowStateView = FlowStateView, FS extends FlowState<FSD, FV> = FlowState<FSD, FV>, FST extends FlowStateType<FSD, FV, FS> = FlowStateType<FSD, FV, FS>, K1 extends keyof FSD = keyof FSD, K2 extends keyof FSD = keyof FSD>(
    fs: FST,
    fromDataScope: K1,
    id: string,
    toDataScope: K2
): FST => {
    let didMove = false
    fs = fs.update('data', (data) => {
        const d = {...data} as FS['data']
        if(d[fromDataScope] && d[fromDataScope][id]) {
            didMove = true
            d[fromDataScope] = {...d[fromDataScope]}
            d[toDataScope] = {...d[toDataScope] || {}}
            d[toDataScope][id] = {
                ...d[fromDataScope][id],
                type: toDataScope as string,
            }
            delete d[fromDataScope][id]
        }
        return d
    })

    if(didMove) {
        fs = fs.update('view', view => {
            const v = {...(view as FS['view']) || {}} as FS['view']
            if(v[fromDataScope][id]) {
                v[fromDataScope] = {...v[fromDataScope]}
                v[toDataScope] = {...v[toDataScope] || {}}
                // @ts-ignore
                v[toDataScope][id] = {...v[fromDataScope][id]}
                delete v[fromDataScope][id]
            }

            return v
        })
        fs = fs.update('viewList', viewList => {
            const vl = [...(viewList as FS['viewList'] || [])] as FS['viewList']
            const index = vl.findIndex(vi => vi.id === id)
            if(index !== -1) {
                (vl as FS['viewList']).splice(index, 1, {
                    ...vl[index],
                    type: toDataScope as string,
                })
            }

            return vl
        })
    }
    return fs
}
