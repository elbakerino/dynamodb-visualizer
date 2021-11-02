import React from 'react'

export type CreateStateContextSetStateCombined<C, A> = { setState: React.Dispatch<React.SetStateAction<C>> } & A

export interface CreateStateContextResult<C, A extends {} = {}> {
    useState: () => C
    useSetState: () => CreateStateContextSetStateCombined<C, A>
    Provider: React.ComponentType<React.PropsWithChildren<{
        initialState: C | (() => C)
        extraActions?: A
    }>>
}

export const createStateContext = <C extends any, A extends {} = {}>(): CreateStateContextResult<C, A> => {
    // @ts-ignore
    const StateContext = React.createContext<C>()
    // @ts-ignore
    const SetStateContext = React.createContext<CreateStateContextSetStateCombined<C, A>>()

    const StateContextProvider: CreateStateContextResult<C, A>['Provider'] = (
        {children, initialState, extraActions}
    ): React.ReactElement => {
        const [state, setState] = React.useState<C>(initialState)

        const setter = React.useMemo(() => ({
            ...(extraActions || {}),
            setState,
        }), [setState, extraActions])

        return <StateContext.Provider value={state}>
            <SetStateContext.Provider value={setter as CreateStateContextSetStateCombined<C, A>}>
                {children}
            </SetStateContext.Provider>
        </StateContext.Provider>
    }

    const useState: CreateStateContextResult<C, A>['useState'] = () => React.useContext(StateContext)
    const useSetState: CreateStateContextResult<C, A>['useSetState'] = () => React.useContext(SetStateContext)

    return {
        useState,
        useSetState,
        Provider: StateContextProvider,
    }
}
