import React, { memo } from 'react'
import { EdgeProps, getBezierPath, getEdgeCenter, getMarkerEnd } from 'react-flow-renderer'
import { useTheme } from '@material-ui/core'

export const EdgeInteractiveBase: React.ComponentType<EdgeProps & {
    foreignObjectSize?: number
    children?: React.ReactElement
    onHighlight?: (highlight: boolean) => void
    showDot?: boolean
}> = (
    {
        id,
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        style = {},
        data,
        arrowHeadType,
        markerEndId,
        selected,
        foreignObjectSize,
        onHighlight,
        showDot,
        children,
    }
) => {
    //console.log('edge data', data)
    const edgePath = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    })
    const markerEnd = getMarkerEnd(arrowHeadType, markerEndId)
    const {palette} = useTheme()

    const [highlight, setHighlight] = React.useState(false)
    const [hovering, setHovering] = React.useState(false)
    const [edgeCenterX, edgeCenterY] = getEdgeCenter({
        sourceX,
        sourceY,
        targetX,
        targetY,
    })

    React.useEffect(() => {
        if(onHighlight) {
            onHighlight(highlight)
        }
    }, [highlight, onHighlight])

    React.useEffect(() => {
        if(hovering) {
            setHighlight(true)
            return
        }
        const timer = window.setTimeout(() => {
            setHighlight(false)
        }, 350)
        return () => window.clearTimeout(timer)
    }, [hovering, setHighlight])
    const enforcedObjectSize = (typeof foreignObjectSize === 'number' && foreignObjectSize > 0 ? foreignObjectSize : showDot && selected ? 8 : 0)
    return <>
        <path
            id={id}
            className="react-flow__edge-path"
            d={edgePath}
            markerEnd={markerEnd}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            style={{
                ...style,
                strokeWidth: highlight ? 4 : undefined,
                transition: '0.18s linear stroke-width',
                stroke: selected ? palette.primary.main : palette.text.hint,
            }}
        />
        {children && typeof foreignObjectSize === 'number' ? <foreignObject
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            width={enforcedObjectSize}
            height={enforcedObjectSize}
            x={edgeCenterX - enforcedObjectSize / 2}
            y={edgeCenterY - enforcedObjectSize / 2}
            className="edgebutton-foreignobject"
            requiredExtensions="http://www.w3.org/1999/xhtml"
        >
            <div style={{display: 'flex', height: '100%'}}>
                {showDot ? <span
                    style={{
                        background: palette.primary.main,
                        pointerEvents: 'none',
                        borderRadius: '100%',
                        width: 8,
                        height: 8,
                        zIndex: 1,
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}
                /> : null}
                {children}
            </div>
        </foreignObject> : null}
    </>
}
export const EdgeInteractive = memo(EdgeInteractiveBase)
