import React from 'react'
import { DynamoDataTableSecondaryKeys } from './DynamoDataTableSecondaryKeys'
import { Box, Paper, Typography } from '@material-ui/core'
import { useDynamoTables } from '../feature/DynamoTables'
import { usePageTable } from './PageDynamoTable'

export const DynamoTableInfo = () => {
    const {activeTable} = usePageTable()
    const {tableDetails} = useDynamoTables()
    const table = activeTable ? tableDetails.get(activeTable) : undefined
    const tableSchema = table?.schema?.schema
    const tableSchemaPrimaryIndex = tableSchema?.Table?.KeySchema
    const tableSchemaSecIndex = tableSchema?.Table?.GlobalSecondaryIndexes

    return <Box m={2} style={{flexGrow: 1, overflow: 'auto'}}>
        {tableSchema ? <>
            <Typography variant={'h1'} gutterBottom style={{marginTop: 12}}>
                Table: <code>{table?.meta?.name}</code>
            </Typography>
            {tableSchema?.Table?.TableName ? <Typography variant={'h6'} component={'h2'} gutterBottom style={{lineHeight: 1}}>
                <Typography variant={'body2'} component={'span'} style={{lineHeight: 1}}>
                    Table name in schema:
                </Typography>
                <span style={{fontWeight: 'bold', display: 'block'}}>
                    {tableSchema?.Table.TableName}
                </span>
            </Typography> : null}
            {tableSchema && tableSchema['@metadata'] ?
                <Typography variant={'h6'} component={'h2'} gutterBottom style={{lineHeight: 1}}>
                    <Typography variant={'body2'} component={'span'} style={{lineHeight: 1.25}}>
                        <code>@metadata.effectiveUri</code>
                    </Typography>
                    <span style={{display: 'block'}}>{tableSchema['@metadata'].effectiveUri ? tableSchema['@metadata'].effectiveUri : '-'}</span>
                </Typography> : null}
        </> : null}

        {tableSchemaPrimaryIndex ? <Box
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
                        //background: typeof activeIndex === 'undefined' ? undefined : 'transparent',
                        //cursor: 'pointer'
                    }}
                    //tabIndex={-1}
                    //onClick={() => setActiveIndex(undefined)}
                >
                    <Box my={2} mx={2}>
                        {tableSchemaPrimaryIndex[0] ? <Box py={0.5}>
                            <Typography variant={'body2'} style={{opacity: 0.65}}>
                                Primary Key:
                            </Typography>
                            <Typography variant={'body2'}>
                                {tableSchemaPrimaryIndex[0].AttributeName}
                                {' '}
                                <small>({tableSchemaPrimaryIndex[0].KeyType})</small>
                            </Typography>
                        </Box> : null}
                        {tableSchemaPrimaryIndex[1] ? <Box py={0.5}>
                            <Typography variant={'body2'} style={{opacity: 0.65}}>
                                Sort Key:
                            </Typography>
                            <Typography variant={'body2'}>
                                {tableSchemaPrimaryIndex[1].AttributeName}
                                {' '}
                                <small>({tableSchemaPrimaryIndex[1].KeyType})</small>
                            </Typography>
                        </Box> : null}
                    </Box>
                </Paper>
            </Box>
        </Box> : null}

        <DynamoDataTableSecondaryKeys
            tableSchemaSecIndex={tableSchemaSecIndex}
            openId={'info'}
            activeIndex={undefined}
            setActiveIndex={undefined}
        />
    </Box>
}
