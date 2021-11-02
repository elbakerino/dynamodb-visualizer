import React from 'react'
import { fromJS, Map } from 'immutable'
import { FlowStateDataScopes, FlowStateType } from './FlowTypes'

export interface FlowHistoryContextType {
    hasFuture: boolean
    hasPast: boolean
}

export interface FlowHistoryContextActions {
    goHistory: (steps: number) => void
}

const FlowHistoryContextDefault: FlowHistoryContextType = {
    hasFuture: false,
    hasPast: false,
}

// @ts-ignore
const FlowHistoryContext = React.createContext<FlowHistoryContextType & FlowHistoryContextActions>(FlowHistoryContextDefault)

export const useFlowHistory = (): FlowHistoryContextType & FlowHistoryContextActions => React.useContext(FlowHistoryContext)

// the time between change of content and writing to the history state
// during normal writing, the history state should not be updated constantly
const defaultDebounceTime: number = 460
// rate in which the store changes are saved to the history, e.g. `1` = every change, `4` = every 4th change
// works together with debouncing
// - if rate is e.g. `8` and someone made `5` changes within the debounce time, the last (5th) item is saved
// - thus nothing is lost, even when the rate was not fulfilled
const defaultUpdateRate: number = 8
// maximum number of store changes in the history
// - ! must be min. 10, cleanup works with deleting the first 10 entries, everytime the limit is hit
const defaultMaxItems: number = 400

const initialChangeRater: FlowHistoryRater = {current: 0, last: undefined}

export interface FlowHistoryRater<L extends any = any> {
    current: number
    last: L | undefined
}

export interface FlowHistoryOptions {
    debounceTime?: typeof defaultDebounceTime
    updateRate?: typeof defaultUpdateRate
    maxItems?: typeof defaultMaxItems
}

export const useFlowHistoryMaker = <FSD extends FlowStateDataScopes, FS extends FlowStateType<FSD> = FlowStateType<FSD>>(
    setFlowState: (setter: (fs: FS) => FS) => void,
    initial: FS,
    {
        debounceTime = defaultDebounceTime,
        updateRate = defaultUpdateRate,
        maxItems = defaultMaxItems,
    }: FlowHistoryOptions = {}
): {
    goHistory: (steps: number) => void
    hasFuture: boolean
    hasPast: boolean
    setFlowState: React.Dispatch<React.SetStateAction<FS>>
} => {
    const timer = React.useRef<number | undefined>()
    const historyChangeRater = React.useRef<FlowHistoryRater<FS>>(initialChangeRater)
    const historyDebounce = React.useRef<FS[]>([])
    const [history, setHistory] = React.useState<{
        inHistory: number
        versions: FS[],
    }>({
        inHistory: 0,
        versions: [initial],
    })

    const goHistory = React.useCallback((steps: number) => {
        setHistory((hs) => {
            hs = {...hs}
            const n = hs.inHistory + steps
            if(n >= 0 && n < hs.versions.length && hs.versions[n]) {
                hs.inHistory = n
                setFlowState(() => hs.versions[n])
            }
            return hs
        })
    }, [setHistory, setFlowState])

    const setFlowStateFn: React.Dispatch<React.SetStateAction<FS>> = React.useCallback((updater) => {
        setFlowState((fs) => {
            // @ts-ignore
            fs = updater(fs)
            setHistory(hs => {
                window.clearTimeout(timer.current)
                hs = {...hs}
                const h = hs.versions[hs.versions.length - 1]
                const fullMapFs = Map(fromJS(fs.toObject()))
                const fullMapFsV = h && Map(fromJS(h.toObject()))
                const same = fullMapFsV && fullMapFs.equals(fullMapFsV)
                if(same) {
                    return hs
                }
                // @ts-ignore
                const isDataSame: boolean = fullMapFs.get('data')?.equals(fullMapFsV.get('data')) &&
                    // @ts-ignore
                    fullMapFs.get('connections')?.equals(fullMapFsV.get('connections'))
                // @ts-ignore
                const isViewSame: boolean = fullMapFs.get('view')?.equals(fullMapFsV.get('view'))
                let didReset = false
                hs.versions = [...hs.versions]
                if(hs.versions.length > 0 && hs.versions.length - 1 > hs.inHistory) {
                    didReset = true
                } else if(hs.versions.length > maxItems) {
                    hs.versions.splice(0, 10)
                    hs.inHistory = hs.versions.length - 1
                }
                if(didReset || (!isViewSame && isDataSame)) {
                    historyChangeRater.current.current = 0
                    historyChangeRater.current.last = fs
                    historyDebounce.current = []
                    hs.versions.push(fs)
                    hs.inHistory = hs.versions.length - 1
                    return hs
                }
                historyChangeRater.current.current = historyChangeRater.current.current > maxItems ?
                    0 : historyChangeRater.current.current + 1
                historyChangeRater.current.last = fs
                let historyAdded = false
                if(historyChangeRater.current.current % updateRate === 0) {
                    historyAdded = true
                    historyDebounce.current.push(fs)
                }
                timer.current = window.setTimeout(() => {
                    if(!historyAdded && updateRate !== 1 && historyChangeRater.current.last) {
                        historyDebounce.current.push(historyChangeRater.current.last)
                    }
                    if(historyDebounce.current.length === 0) return

                    // @ts-ignore
                    setHistory((hs) => {
                        hs = {...hs}
                        hs.versions = [...hs.versions]
                        hs.versions.push(...historyDebounce.current)
                        hs.inHistory = hs.versions.length - 1
                        //hs.versions.splice(hs.inHistory, 1, fs)
                        historyDebounce.current = []
                        historyChangeRater.current = initialChangeRater
                        return hs
                    })
                }, debounceTime)

                return hs
            })
            return fs
        })
    }, [setHistory, setFlowState, debounceTime, maxItems, updateRate])

    const hasFuture = history.inHistory < history.versions.length - 1
    const hasPast = history.inHistory > 0

    return {
        goHistory,
        hasFuture,
        hasPast,
        setFlowState: setFlowStateFn,
    }
}

export interface FlowHistoryProviderProps {
    goHistory: (steps: number) => void
    hasFuture: boolean
    hasPast: boolean
}

export const FlowHistoryProvider = (
    {
        children,
        goHistory, hasFuture, hasPast,
    }: React.PropsWithChildren<FlowHistoryProviderProps>
): React.ReactElement => {
    const ctx = React.useMemo(() => ({
        goHistory: goHistory,
        hasFuture: hasFuture,
        hasPast: hasPast,
    }), [
        goHistory,
        hasFuture,
        hasPast,
    ])

    return <FlowHistoryContext.Provider value={ctx}>
        {children}
    </FlowHistoryContext.Provider>
}
