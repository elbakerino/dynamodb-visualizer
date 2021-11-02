import React from 'react'
import { Box } from '@material-ui/core'

export const NodeBox: React.ComponentType<React.PropsWithChildren<{
    isDragging: boolean
}>> = (
    {
        isDragging,
        children,
    }
) => {
    return <Box
        style={{
            position: 'relative',
            opacity: isDragging ? 0.7 : 1,
            transition: '0.26s opacity ease-out',
        }}
    >
        {children}
    </Box>
}
