import React from 'react'

export const useResponsiveInput = (text: string, size: string = '16px') => {
    const [, setMounted] = React.useState(false)
    const [width, setWidth] = React.useState(0)
    React.useEffect(() => {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        // @ts-ignore
        //refInp?.current?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.appendChild(canvas)
        // @ts-ignore
        //context.font = 'Roboto'
        // @ts-ignore
        //context.fontSize = '16px'
        // @ts-ignore
        context.font = size + ' Roboto, Helvetica, Arial, sans-serif'

        // @ts-ignore
        const w = context.measureText(text).width
        canvas.remove()
        setWidth(w)
        const timer = window.setTimeout(() => {
            setMounted(o => !o)
        }, 100)
        return () => window.clearTimeout(timer)
    }, [setMounted, text, size, setWidth])

    const getWidth = React.useCallback((latestWidth: number): number => {
        latestWidth = latestWidth * 1.06
        if(latestWidth < 200) {
            latestWidth = latestWidth + 15
        }
        return latestWidth
    }, [])

    return {
        width, setWidth,
        getWidth,
    }
}
