import { Box, Paper, Typography } from '@material-ui/core'
import React from 'react'

export const DynamoTableDataInfo = (
    {
        tableSchema, tableSchemaKeyIndex, activeTable,
        activeIndex, setActiveIndex,
    }:
        {
            activeTable: string | undefined
            tableSchemaKeyIndex: any
            tableSchema: any
            activeIndex: string | undefined
            setActiveIndex: (ix: string | undefined) => void
        }
) => {
    return <>
        {tableSchema ? <>
            <Typography variant={'h1'} gutterBottom style={{marginTop: 12}}>
                Table: <code>{activeTable}</code>
            </Typography>
            <Typography variant={'h6'} component={'h2'} gutterBottom style={{lineHeight: 1}}>
                <Typography variant={'body2'} component={'span'} style={{lineHeight: 1}}>
                    Table name in schema:
                </Typography>
                <span style={{fontWeight: 'bold', display: 'block'}}>
                        {tableSchema.Table.TableName}
                    </span>
            </Typography>
            {tableSchema && tableSchema['@metadata'] ?
                <Typography variant={'h6'} component={'h2'} gutterBottom style={{lineHeight: 1}}>
                    <Typography variant={'body2'} component={'span'} style={{lineHeight: 1.25}}>
                        <code>@metadata.effectiveUri</code>
                    </Typography>
                    <span style={{display: 'block'}}>{tableSchema && tableSchema['@metadata'] ? tableSchema['@metadata'].effectiveUri : '-'}</span>
                </Typography> : null}
        </> : null}

        {tableSchemaKeyIndex ? <Box
            style={{display: 'flex', flexDirection: 'column', flexWrap: 'wrap'}}
            mt={2} mb={3}
        >
            <Typography variant={'h3'} component={'h2'} style={{width: '100%'}}>Primary Index</Typography>
            <Box>
                <Paper
                    variant={'outlined'}
                    style={{
                        marginRight: 4,
                        marginBottom: 4,
                        background: typeof activeIndex === 'undefined' ? undefined : 'transparent',
                        cursor: 'pointer'
                    }}
                    tabIndex={-1}
                    onClick={() => setActiveIndex(undefined)}
                >
                    <Box my={2} mx={2}>
                        {tableSchemaKeyIndex[0] ? <Box py={0.5}>
                            <Typography variant={'body2'} style={{opacity: 0.65}}>
                                Primary Key:
                            </Typography>
                            <Typography variant={'body2'}>
                                {tableSchemaKeyIndex[0].AttributeName}
                                {' '}
                                <small>({tableSchemaKeyIndex[0].KeyType})</small>
                            </Typography>
                        </Box> : null}
                        {tableSchemaKeyIndex[1] ? <Box py={0.5}>
                            <Typography variant={'body2'} style={{opacity: 0.65}}>
                                Sort Key:
                            </Typography>
                            <Typography variant={'body2'}>
                                {tableSchemaKeyIndex[1].AttributeName}
                                {' '}
                                <small>({tableSchemaKeyIndex[1].KeyType})</small>
                            </Typography>
                        </Box> : null}
                    </Box>
                </Paper>
            </Box>
        </Box> : null}
    </>
}
