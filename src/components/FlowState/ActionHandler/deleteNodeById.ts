import { FlowConnection, FlowState, FlowStateDataScopes, FlowStateType, FlowStateView, FlowViewListEntryNode } from '../FlowTypes'

//export const deleteNodeById = <FSD extends FlowStateDataScopes, FV extends FlowStateView = FlowStateView, FSDA extends FlowState<FSD, FV> = FlowState<FSD, FV>, FST extends FlowStateType<FSD, FV, FSDA> = FlowStateType<FSD, FV, FSDA>, K extends keyof FSD = keyof FSD, ID extends keyof FSDA['data'][K] = keyof FSDA['data'][K]>(
//export const deleteNodeById = <FSD extends FlowStateDataScopes, FV extends FlowStateView = FlowStateView, FSDA extends FlowState<FSD, FV> = FlowState<FSD, FV>, FST extends FlowStateType<FSD, FV, FSDA> = FlowStateType<FSD, FV, FSDA>, K extends keyof FSD = keyof FSD, ID extends keyof FSDA['data' | 'view'][K] = keyof FSDA['data' | 'view'][K], D extends FSD[K] = FSD[K]>(
export const deleteNodeById = <FSD extends FlowStateDataScopes, FV extends FlowStateView = FlowStateView, FS extends FlowState<FSD, FV> = FlowState<FSD, FV>, FST extends FlowStateType<FSD, FV, FS> = FlowStateType<FSD, FV, FS>, K extends keyof FSD = keyof FSD, ID extends keyof FS['data'][K] = keyof FS['data'][K], D extends FSD[K] = FSD[K]>(
    fs: FST,
    dataScope: K,
    id: ID,
    maybe?: (data: D) => boolean,
    partial?: (data: D) => D,
    // when it returns `true` deletes the connection data
    connectionMatch?: (connection: FlowConnection) => boolean,
    connectionRename?: <C extends FlowConnection = FlowConnection>(connection: C) => C | undefined
): FST => {
    let didDelete = false
    fs = fs.update('data', (data) => {
        const d = {...data} as FS['data']
        if(d[dataScope] && d[dataScope][id] && (!maybe || maybe((d[dataScope][id].data as D) || {}))) {
            didDelete = true
            d[dataScope] = {...d[dataScope]}
            if(partial) {
                d[dataScope][id] = {
                    ...d[dataScope][id],
                    data: partial(
                        d[dataScope][id].data as D
                    ),
                }
            } else {
                delete d[dataScope][id]
            }
        }
        return d
    })

    if(didDelete) {
        if(!partial) {
            const id2 = id as keyof FS['view'][K]
            fs = fs.update('view', view => {
                const v = {...(view as FS['view']) || {}}
                if(v[dataScope] && v[dataScope][id2]) {
                    v[dataScope] = {...v[dataScope]}
                    delete v[dataScope][id2]
                }

                return v
            })
        }

        if(partial) {
            fs = fs.update('viewList', (viewList) => {
                const data = fs.get('data') as FS['data']
                const vl = [...(viewList as FS['viewList'] || [])] as FS['viewList']
                const vi = vl.findIndex(c => c.id === id)
                if(vi !== -1) {
                    const v = vl[vi]
                    const vd = 'data' in v && v.data ? v.data : undefined
                    //if(!('_data' in v)) return viewList
                    vl.splice(vi, 1, {
                        ...v,
                        ...(vd ? {
                            data: {
                                ...vd,
                                _data: {
                                    ...(vd._data || {}),
                                    ...data[dataScope][id].data,
                                }
                            },
                        } : {})
                    } as FlowViewListEntryNode<FSD, FV>)
                }
                return vl
            })
        }


        const deleteIds = partial ? [] : [id]
        if(connectionMatch) {
            fs = fs.update('connections', connections => {
                let cons: FS['connections'] = [...(connections as FS['connections']) || []]
                cons = cons.filter(con => {
                    if(connectionMatch(con)) {
                        deleteIds.push(con.id as ID)
                        return false
                    }
                    return true
                })
                return cons
            })
        }
        if(deleteIds.length > 0) {
            fs = fs.update('viewList', viewList => {
                const vl = [...(viewList as FS['viewList'] || [])] as FS['viewList']
                deleteIds.forEach(dId => {
                    const index = vl.findIndex(vi => vi.id === dId)
                    if(index !== -1) {
                        vl.splice(index, 1)
                    }
                })

                return vl
            })
        }

        if(connectionRename) {
            const toRenameConnections: FlowConnection[] = [];

            (fs.get('connections') as FS['connections']).forEach((con: FlowConnection) => {
                const renamed = connectionRename(con)
                if(typeof renamed !== 'undefined') {
                    toRenameConnections.push(renamed)
                }
            })
            if(toRenameConnections.length > 0) {
                fs = fs.update('connections', connections => {
                    let cons: FS['connections'] = [...(connections as FS['connections']) || []]
                    toRenameConnections.forEach(con => {
                        const i = cons.findIndex(c => c.id === con.id)
                        if(i !== -1) {
                            cons.splice(i, 1, con)
                        }
                    })
                    return cons
                })
                fs = fs.update('viewList', viewList => {
                    const vl = [...(viewList as FS['viewList'] || [])] as FS['viewList']
                    toRenameConnections.forEach(con => {
                        const i = vl.findIndex(c => c.id === con.id)
                        if(i !== -1) {
                            vl.splice(i, 1, con)
                        }
                    })
                    return vl
                })
            }
        }
    }
    return fs
}
