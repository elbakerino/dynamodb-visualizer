import { SnapGrid } from 'react-flow-renderer'
import React from 'react'

export interface FlowToolbarContextType {
    snapToGrid: boolean
    snapGrid: SnapGrid
}

export interface FlowToolbarContextActions {
    updateToolbar: React.Dispatch<React.SetStateAction<FlowToolbarContextType>>
}

// @ts-ignore
const FlowToolbarContext = React.createContext<FlowToolbarContextType & FlowToolbarContextActions>({})

export const useFlowToolbar = (): FlowToolbarContextType & FlowToolbarContextActions => React.useContext(FlowToolbarContext)

export interface FlowToolbarProviderProps {
    initialSnapToGrid?: boolean
    initialSnapGrid?: [number, number]
}

export const FlowToolbarProvider = (
    {
        children,
        initialSnapToGrid,
        initialSnapGrid,
    }: React.PropsWithChildren<FlowToolbarProviderProps>
): React.ReactElement => {
    const [state, setState] = React.useState<FlowToolbarContextType>({
        snapToGrid: Boolean(initialSnapToGrid),
        snapGrid: initialSnapGrid || [10, 10] as SnapGrid,
    })

    const ctx = React.useMemo(() => ({
        ...state,
        updateToolbar: setState,
    }), [
        state,
        setState
    ])

    return <FlowToolbarContext.Provider value={ctx}>
        {children}
    </FlowToolbarContext.Provider>
}
