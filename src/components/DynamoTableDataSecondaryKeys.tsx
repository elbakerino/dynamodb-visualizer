import { Box, Paper, Typography } from '@material-ui/core'
import React, { memo } from 'react'

const DynamoTableDataSecondaryKeysBase = (
    {
        tableSchemaSecIndex, openId,
        activeIndex, setActiveIndex,
    }: {
        tableSchemaSecIndex: any
        openId: string | undefined
        activeIndex: string | undefined
        setActiveIndex: (ix: string|undefined) => void
    }
) => {
    return <>
        {tableSchemaSecIndex ? <Box mt={1} mb={openId === 'info' ? 2 : 0}>
            {openId === 'info' ?
                <Typography variant={'h3'} component={'h2'} gutterBottom>Secondary Indexes</Typography> : null}

            <Box style={{
                display: 'flex',
                flexWrap: openId === 'info' ? 'wrap' : 'nowrap',
                overflow: 'auto',
            }}>
                {tableSchemaSecIndex.map((keyIndex: any) => <Paper
                    key={keyIndex.IndexName} variant={'outlined'}
                    style={{
                        marginRight: 4,
                        marginBottom: openId === 'info' ? 4 : 0,
                        minWidth: openId === 'info' ? '24%' : 0,
                        flexGrow: openId === 'info' ? 1 : 0,
                        flexShrink: 0,
                        background: activeIndex === keyIndex.IndexName ? undefined : 'transparent',
                        cursor: 'pointer'
                    }}
                    tabIndex={-1}
                    onClick={() => setActiveIndex(keyIndex.IndexName)}
                >
                    <Box
                        my={openId === 'info' ? 2 : 0}
                        mx={openId === 'info' ? 2 : 1}
                    >
                        <Typography
                            variant={'overline'} component={'span'} gutterBottom={openId === 'info'}
                            style={{
                                display: 'block',
                                fontWeight: activeIndex === keyIndex.IndexName ? 'bold' : 'normal'
                            }}
                        >
                            {keyIndex.IndexName}
                        </Typography>

                        {openId === 'info' ? <>
                            {keyIndex.KeySchema[0] ? <Box py={0.5}>
                                <Typography variant={'body2'} style={{opacity: 0.65}}>
                                    Primary Key:
                                </Typography>
                                <Typography variant={'body2'}>
                                    {keyIndex.KeySchema[0].AttributeName}
                                    {' '}
                                    <small>({keyIndex.KeySchema[0].KeyType})</small>
                                </Typography>
                            </Box> : null}
                            {keyIndex.KeySchema[1] ? <Box py={0.5}>
                                <Typography variant={'body2'} style={{opacity: 0.65}}>
                                    Sort Key:
                                </Typography>
                                <Typography variant={'body2'}>
                                    {keyIndex.KeySchema[1].AttributeName}
                                    {' '}
                                    <small>({keyIndex.KeySchema[1].KeyType})</small>
                                </Typography>
                            </Box> : null}
                        </> : null}
                    </Box>
                </Paper>)}
            </Box>
        </Box> : null}
    </>
}

export const DynamoTableDataSecondaryKeys = memo(DynamoTableDataSecondaryKeysBase)
