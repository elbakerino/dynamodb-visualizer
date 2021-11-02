import { KeyboardEventHandler } from 'react'

export const handlePreventPaneKeyboardEvent: KeyboardEventHandler<any> = (e) => {
    if(
        !e.ctrlKey ||
        e.key === 'delete'
    ) {
        //console.log('handlePreventPaneKeyboardEvent', e)
        e.stopPropagation()
    }
}
