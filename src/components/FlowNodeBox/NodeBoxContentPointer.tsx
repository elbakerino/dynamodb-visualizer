import React from 'react'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

const useStyles = makeStyles(({palette}: Theme) =>
    createStyles<'pointer', {
        direction: string,
        width?: number,
        inset?: number,
        color: string | undefined,
    }>({
        pointer: {
            position: 'absolute',
            right: ({direction}) => direction === 'right' ? 0 : undefined,
            left: ({direction}) => direction === 'left' ? 0 : undefined,
            transform: ({direction}) => direction === 'left' ? 'rotate(180deg)' : undefined,
            zIndex: -1,
            top: 0,
            bottom: 0,
            //pointerEvents: 'none',
            '&:before': {
                width: ({width}) => width || 20,
                height: '50%',
                position: 'absolute',
                left: ({inset}) => `calc(100% - ${inset}px)`,
                content: '""',
                zIndex: 0,
                top: 0,
                background: ({color}) => 'linear-gradient(to right top, ' + (color || palette.background.paper) + ' 50%, transparent 50%)',
            },
            '&:after': {
                width: ({width}) => width || 20,
                height: '50%',
                position: 'absolute',
                left: ({inset}) => `calc(100% - ${inset}px)`,
                zIndex: 0,
                content: '""',
                top: '50%',
                background: ({color}) => 'linear-gradient(to right bottom, ' + (color || palette.background.paper) + ' 50%, transparent 50%)',
            }
        },
    }),
)

export const NodeBoxContentPointer: React.ComponentType<{
    direction: string
    activeColor: string | undefined
    width: number | undefined
    inset?: number | undefined
}> = ({direction, activeColor, width, inset}) => {
    const classes = useStyles({
        direction,
        color: activeColor,
        width,
        inset,
    })
    return <span className={classes.pointer}/>
}
