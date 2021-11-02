import React from 'react'

export interface FlowStateNodeContextTypeData {

}

export interface FlowStateNodeContextTypeView {

}


// @ts-ignore
const FlowStateNodeData = React.createContext<FlowStateNodeContextTypeData>()
// @ts-ignore
const FlowStateNodeView = React.createContext<FlowStateNodeContextTypeView>()

export const FlowStateNodeProvider = <D extends { _data: any, _view: any }>(
    {children, data}: React.PropsWithChildren<{
        data: D
    }>
): React.ReactElement => {
    return <FlowStateNodeView.Provider value={data?._view}>
        <FlowStateNodeData.Provider value={data?._data}>
            {children}
        </FlowStateNodeData.Provider>
    </FlowStateNodeView.Provider>
}

export type flowStateNodeSelector<D extends { _data: any, _view: any }, PD extends {} = {}> = (data: D['_data'], view: D['_view']) => PD

export const selectFlowState = <PD extends {}, D extends { _data: any, _view: any }, P extends PD = PD, RP extends Omit<P, keyof PD> = Omit<P, keyof PD>>(
    selector: flowStateNodeSelector<D, PD>,
    Component: React.ComponentType<P>
): React.ComponentType<RP> => {
    const NewComponent = (props: RP) => {
        const data = React.useContext(FlowStateNodeData)
        const view = React.useContext(FlowStateNodeView)
        const extraProps = selector(data as D['_data'], view as D['_view'])
        // @ts-ignore
        return <Component {...props as RP} {...extraProps}/>
    }
    NewComponent.displayName = 'SelectFlowState(' + (Component.displayName || Component.name || 'Anonymous') + ')'
    return NewComponent
}
