import { FlowNodeViewOptions } from '../../FlowState/FlowTypes'

export const calcPxByView = <V extends FlowNodeViewOptions>(view: V | undefined): number =>
    (view?.fontSize || 1) > 1 ? 2 :
        view?.fontWeight === 'bold' && (view?.fontSize || 1) === 1 ? 1.5 : 1
