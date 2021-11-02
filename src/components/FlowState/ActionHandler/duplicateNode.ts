import { FlowState, FlowStateDataScopes, FlowStateType, FlowStateView, FlowViewListEntryNode } from '../FlowTypes'
import { makeView } from './makeView'
import { genId } from '../../../lib/genId'

export const duplicateNode = <FSD extends FlowStateDataScopes, FV extends FlowStateView, FS extends FlowState<FSD, FV> = FlowState<FSD, FV>, FST extends FlowStateType<FSD, FV, FS> = FlowStateType<FSD, FV, FS>, K extends keyof FSD = keyof FSD>(
    fs: FST,
    dataScope: K,
    id: string,
    offsetY: number,
    startLayer?: number,
): {
    fs: FST
    id?: string
    node?: FlowViewListEntryNode<FSD, FV>
} => {
    const itemData = fs.getIn(['data', dataScope, id]) as FS['data'][K][keyof FS['data'][K]]
    const itemView = fs.getIn(['view', dataScope, id]) as FS['view'][K][keyof FS['view'][K]]

    if(!itemView || !itemData) return {fs}

    const newId = genId(8)

    const newItemView = {
        ...itemView,
        position: {
            x: itemView.position.x + 30,
            y: itemView.position.y + (30 * offsetY),
        },
    }
    fs = fs.setIn(['data', dataScope, newId], itemData)
    fs = fs.setIn(['view', dataScope, newId], newItemView)

    const viewEntry = makeView<FSD, FV, FS>(
        dataScope,
        newId,
        newItemView,
        fs.get('data') as FS['data']
    )

    fs = fs.update('viewList', viewList => {
        const v = [...(viewList as FS['viewList']) || []] as FS['viewList']
        const index = v.findIndex(vi => vi.id === id)
        const view = fs.get('view') as FS['view']
        if(view && view[dataScope][id] && index !== -1) {
            v.splice(
                typeof startLayer !== 'undefined' ? startLayer :
                    index + 1,
                0,
                viewEntry
            )
        }

        return v
    })
    return {
        fs,
        id: newId,
        node: viewEntry,
    }
}
