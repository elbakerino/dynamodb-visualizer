import React from 'react'
import Box from '@material-ui/core/Box'
import Paper from '@material-ui/core/Paper'
import useTheme from '@material-ui/core/styles/useTheme'
import { NamedColorMapEntry, useNamedColors } from '../../lib/NamedColors/NamedColorsProvider'
import { FlowStateView } from '../FlowState/FlowTypes'
import { NodeBoxContentPointer } from './NodeBoxContentPointer'
import Badge from '@material-ui/core/Badge'

export const flowBoxContentColorMap: Partial<NamedColorMapEntry>[] = [
    {
        name: 'background__default',
    }, {
        name: 'background__paper',
    }, {
        color: '#f9f4a5',
    }, {
        name: 'primary__dark',
    }, {
        name: 'primary__main',
    }, {
        name: 'primary__light',
    }, {
        name: 'secondary__dark',
    }, {
        name: 'secondary__main',
    }, {
        name: 'secondary__light',
    }, {
        name: 'error__dark',
    }, {
        name: 'error__main',
    }, {
        name: 'error__light',
    }, {
        name: 'warning__dark',
    }, {
        name: 'warning__main',
    }, {
        name: 'warning__light',
    }, {
        name: 'info__dark',
    }, {
        name: 'info__main',
    }, {
        name: 'info__light',
    }, {
        name: '_green__800',
    }, {
        name: '_green__600',
    }, {
        name: '_green__400',
    }, {
        name: '_grey__800',
    }, {
        name: '_grey__600',
    }, {
        name: '_grey__400',
    },
]

export const NodeBoxContent: React.ComponentType<React.PropsWithChildren<{
    type: string,
    id: string,
    selected: boolean
    allowClicks?: boolean | undefined
    onFocus?: React.Dispatch<React.SetStateAction<boolean>>
    p?: number
    py?: number
    px?: number
    boxStyles?: React.CSSProperties
    clickable?: React.ReactElement | null
    clickablePos?: 'right' | 'left'
    colorMapId?: string
} & Partial<Omit<FlowStateView, 'position' | 'fontSize'>>>> = (
    {
        selected,
        children,
        onFocus,
        allowClicks,
        p,
        px,
        py,
        color,
        fontWeight,
        elevate,
        outline,
        boxStyles,
        clickable,
        clickablePos = 'right',
        pointer,
        colorMapId = 'flow_box',
    }
) => {
    const lastTouchStart = React.useRef(0)
    const [clicked, setClicked] = React.useState(false)
    const [ownFocus, setOwnFocus] = React.useState(false)
    const containerRef = React.useRef(null)
    const {palette} = useTheme()
    React.useEffect(() => {
        if(!selected) {
            setOwnFocus(false)
        }
    }, [selected, setOwnFocus])
    React.useEffect(() => {
        if(!selected && clicked) {
            setClicked(false)
        } else if(selected && !clicked) {
            // case happen e.g. on select and type switch re-rendering
            setClicked(true)
        }
    }, [selected, setClicked, setOwnFocus, clicked])

    React.useEffect(() => {
        if(onFocus) {
            onFocus(clicked)
        }
    }, [clicked, onFocus])

    const {getNamedColor} = useNamedColors(colorMapId)
    const tmpColor = (color && getNamedColor(color)) || undefined
    // todo: change post-it color for dark setting
    const activeColor = (palette.type === 'dark' && tmpColor?.color === '#f9f4a5' ? '#fffaaf' : tmpColor?.color) || color || undefined
    // const borderWidth = fontWeight === 'bold' ?
    //     selected && outline ? 3 : 2 :
    //     selected && outline ? 2 :
    //         !outline && elevate ? 0 : 1
    const borderWidth = fontWeight === 'bold' ? 3 :
        !outline && elevate ? 0 : 1

    const pointerDirection = pointer?.direction

    const borderWidthCss =
        pointerDirection === 'both' ? borderWidth + 'px 0 ' + borderWidth + 'px 0' :
            pointerDirection === 'left' ? borderWidth + 'px ' + borderWidth + 'px ' + borderWidth + 'px 0px' :
                pointerDirection === 'right' ? borderWidth + 'px 0px ' + borderWidth + 'px ' + borderWidth : borderWidth

    const backgroundColor =
        outline ?
            palette.background.default :
            activeColor ?
                activeColor : palette.background.paper

    const textColor =
        palette.getContrastText(
            outline ?
                palette.background.default :
                activeColor ?
                    activeColor : palette.background.paper
        )

    const borderColor =
        outline ?
            activeColor ? activeColor : palette.background.paper :
            !selected && elevate ? 'transparent' : palette.divider
    //selected ? palette.primary.main : undefined

    const borderStyle = selected && !ownFocus ? 'dashed' : 'solid'
    const handleClick = (target: EventTarget) => {
        setClicked(true)
        const ownFocus = Boolean(
            target === containerRef.current || (
                // @ts-ignore
                target === containerRef.current?.firstChild ||
                // @ts-ignore
                target === containerRef.current?.firstChild?.firstChild
            ) || (
                pointerDirection && (
                    // @ts-ignore
                    target === containerRef.current?.firstChild?.children[0] ||
                    // @ts-ignore
                    (pointerDirection === 'right' && target === containerRef.current?.children[0]?.firstChild) ||
                    // @ts-ignore
                    target === containerRef.current?.children[1] ||
                    // @ts-ignore
                    ((pointerDirection === 'left' || pointerDirection === 'both') && target === containerRef.current?.children[1]?.firstChild) ||
                    // @ts-ignore
                    (pointerDirection === 'both' && target === containerRef.current?.lastChild)
                )
            )
        )
        setOwnFocus(ownFocus)
        // @ts-ignore
        const nodeName = target.nodeName
        // todo: add better "safe to allow dragging components" test or even use some `dataset` for programmatically use
        return !ownFocus && (nodeName !== 'HR' && nodeName !== 'DIV')
    }
    return <div
        ref={containerRef}
        style={{position: 'relative'}}
        tabIndex={-1}
        onTouchStart={() => {
            lastTouchStart.current = Date.now()
        }}
        onTouchEnd={e => {
            const now = Date.now()
            if(lastTouchStart.current && (now - lastTouchStart.current) < 160) {
                // todo: implement `treatAsInnerDrag`
                handleClick(e.target)
            }
        }}
        onMouseDown={e => {
            const treatAsInnerDrag = handleClick(e.target)
            if(treatAsInnerDrag) {
                // this stops e.g. dragging when selecting something in an `input` field
                e.stopPropagation()
            }
        }}
    >
        {pointerDirection === 'left' || pointerDirection === 'both' ?
            <NodeBoxContentPointer
                direction={'left'}
                activeColor={activeColor}
                width={pointer?.widthLeft || pointer?.width}
                inset={elevate ? 4 : 0}
            /> : null}

        <Paper
            variant={elevate ? 'elevation' : 'outlined'}
            elevation={elevate ? 4 : 0}
            tabIndex={-1}
            style={{
                borderRadius: pointerDirection ? 0 : elevate ? 1 : 6,
                background: backgroundColor,
                color: textColor,
                borderColor: borderColor,
                borderStyle: borderStyle,
                borderWidth: borderWidthCss,
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
            }}
        >
            {clickable && clickablePos === 'left' ? clickable : null}

            <Box
                style={{
                    ...boxStyles,
                    pointerEvents: clicked || allowClicks ? undefined : 'none',
                }}
                p={p} px={px} py={py}
            >
                {children}
            </Box>

            {clickable && clickablePos === 'right' ? clickable : null}
        </Paper>

        <span style={{position: 'absolute', top: 0, right: 0, height: 0}}>
        <Badge
            variant={'dot'}
            color={'secondary'}
            invisible={!selected}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
        />
        </span>

        {pointerDirection === 'right' || pointerDirection === 'both' ?
            <NodeBoxContentPointer
                direction={'right'}
                width={pointer?.widthRight || pointer?.width}
                inset={elevate ? 4 : 0}
                activeColor={activeColor}
            /> : null}
    </div>
}
