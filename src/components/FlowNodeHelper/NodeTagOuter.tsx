import React, { ReactNode } from 'react'
import Typography, { TypographyProps } from '@material-ui/core/Typography'
import { useTheme } from '@material-ui/core'

export const NodeTagOuter: React.ComponentType<TypographyProps<'button'> & {
    label?: ReactNode
    highlight?: boolean
    position?: 'top' | 'left'
}> = (
    {
        label,
        highlight,
        position = 'top',
        tabIndex,
        ...props
    }
) => {
    const {palette} = useTheme()
    return <Typography
        {...props}
        onClick={props.onClick}
        tabIndex={props.onClick ? tabIndex : -1}
        variant={'overline'}
        className={props.onClick ? 'nodrag' : undefined}
        component={'button'}
        style={{
            lineHeight: 1.6,
            color: 'inherit',
            border: 0,
            transform: position === 'top' ? 'translateY(-80%)' : 'translate(-80%, 20%) rotate(-90deg)',
            position: 'absolute',
            background: palette?.primary?.main,
            left: 0,
            zIndex: 0,
            padding: position === 'top' ? '0 6px 3px 6px' : '3px 6px 3px 6px',
            //textOrientation: position === 'top' ? undefined : 'upright',
            opacity: highlight ? 1 : 0.01,
            ...props.style,
        }}
    >
        <span style={{color: palette.getContrastText(palette?.primary?.main)}}>{label}</span>
    </Typography>
}
