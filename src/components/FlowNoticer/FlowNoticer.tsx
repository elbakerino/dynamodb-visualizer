import React, { memo } from 'react'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'

const FlowNoticerBase: React.ComponentType<{
    showEmptyNotice: boolean
}> = ({showEmptyNotice}) => {
    return <>
        <Box
            mx={2}
            my={1}
            style={{
                display: 'flex',
                position: 'absolute',
                zIndex: 0,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
            }}
        >
            {showEmptyNotice ? <Typography
                variant={'h4'} component={'p'}
                style={{
                    whiteSpace: 'pre',
                    textAlign: 'center',
                    opacity: 0.5,
                    fontStyle: 'italic',
                }}
            >
                Double click here to start!
            </Typography> : null}
        </Box>
    </>
}

export const FlowNoticer = memo(FlowNoticerBase)
