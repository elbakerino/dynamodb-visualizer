import { FlowNodeViewOptions } from '../../FlowState/FlowTypes'

export const calcPyByView = <V extends FlowNodeViewOptions>(view: V | undefined): number =>
    view?.fontSize === 0.85 ? 0.125 :
        view?.fontSize === 1 ? 0.5 : 1
