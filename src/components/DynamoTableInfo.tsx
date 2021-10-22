import React from 'react'
import { DynamoTableDataInfo } from './DynamoTableDataInfo'
import { DynamoTableDataSecondaryKeys } from './DynamoTableDataSecondaryKeys'
import { Box } from '@material-ui/core'

export const DynamoTableInfo = (
    {
        tables,
        activeTable,
    }: {
        tables: any[]
        activeTable: string | undefined
    }
) => {
    const table = tables.find(t => t.id === activeTable)
    const tableSchema = table?.schema
    const tableSchemaKeyIndex = table?.schema?.Table?.KeySchema
    const tableSchemaSecIndex = table?.schema?.Table?.GlobalSecondaryIndexes

    return <Box m={2} style={{flexGrow: 1, overflow: 'auto'}}>
        <DynamoTableDataInfo
            tableSchema={tableSchema}
            activeTable={activeTable}
            tableSchemaKeyIndex={tableSchemaKeyIndex}
        />

        <DynamoTableDataSecondaryKeys
            tableSchemaSecIndex={tableSchemaSecIndex}
            openId={'info'}
            activeIndex={undefined}
            setActiveIndex={undefined}
        />
    </Box>
}
