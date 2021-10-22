import React from 'react'
import Box from '@material-ui/core/Box'
import { InputTextJson } from './InputTextJson'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import Typography from '@material-ui/core/Typography'
import Alert from '@material-ui/lab/Alert'
import IcExpandMore from '@material-ui/icons/ExpandMore'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import IcCheck from '@material-ui/icons/Check'
import { Button } from '@material-ui/core'

export const DynamoTableMeta = (
    {
        tables,
        updateTables,
        activeTable,
    }: {
        tables: any[],
        updateTables: (table: (any | ((table?: any) => any)), id: (string | undefined)) => void
        activeTable: string | undefined
    }
) => {
    const [openId, setOpenId] = React.useState<string | undefined>(undefined)
    const table = tables.find(t => t.id === activeTable)
    const tableSchema = table?.schema
    const tableExampleData = table?.exampleData
    //console.log(tableSchema)
    //console.log(tableExampleData)

    return <Box m={2} style={{
        flexGrow: 1, overflow: 'auto', display: 'flex',
        flexDirection: 'column', alignContent: 'flex-start',
    }}>
        <Typography variant={'h1'} gutterBottom>
            Table Config: <code>{activeTable}</code>
        </Typography>

        {table ?
            <Box style={{display: 'flex', flexDirection: 'column', overflow: 'auto', flexGrow: 1}} my={2}>
                <Accordion
                    expanded={openId === 'schema'} onChange={() => setOpenId(id => id === 'schema' ? undefined : 'schema')}
                    style={{
                        display: 'flex', flexDirection: 'column',
                        overflow: openId === 'schema' ? 'auto' : 'hidden',
                        flexShrink: openId === 'schema' ? 1 : 0,
                    }}
                    TransitionProps={{style: {overflow: 'auto'}, timeout: 60}}
                >
                    <AccordionSummary
                        expandIcon={<IcExpandMore/>}
                        aria-controls="table-config--schema--c"
                        id="table-config--schema--h"
                        style={{flexShrink: 0}}
                    >
                        <Box style={{display: 'flex', flexDirection: 'column'}}>
                            <Typography>Table Schema</Typography>
                            <Typography variant={'body2'}>{
                                tableSchema && !tableSchema?.Table ? 'invalid, Table not set' :
                                    tableSchema?.Table ? <>
                                            <IcCheck fontSize={'inherit'} style={{verticalAlign: 'text-bottom'}}/>
                                            {' configured'}
                                        </> :
                                        'missing'
                            }</Typography>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails style={{flexWrap: 'wrap'}}>
                        <InputTextJson
                            label={'Schema as JSON'}
                            value={tableSchema}
                            onChange={(newValue) => {
                                updateTables((t: any) => ({...t, schema: newValue}), activeTable)
                            }}
                        />
                        <Button size={'small'} style={{marginTop: 4}}>save</Button>
                    </AccordionDetails>
                </Accordion>
                <Accordion
                    expanded={openId === 'exampleData'} onChange={() => setOpenId(id => id === 'exampleData' ? undefined : 'exampleData')}
                    style={{
                        display: 'flex', flexDirection: 'column',
                        overflow: openId === 'exampleData' ? 'auto' : 'hidden',
                        flexShrink: openId === 'exampleData' ? 1 : 0,
                        //overflow: 'auto',
                    }}
                    TransitionProps={{style: {overflow: 'auto'}, timeout: 60}}
                >
                    <AccordionSummary
                        expandIcon={<IcExpandMore/>}
                        aria-controls="table-config--exampleData--c"
                        id="table-config--exampleData--h"
                        style={{flexShrink: 0}}
                    >
                        <Box style={{display: 'flex', flexDirection: 'column'}}>
                            <Typography>Example Data</Typography>
                            <Typography variant={'body2'}>{
                                tableExampleData ?
                                    !tableExampleData?.Items ? 'invalid, Items not set' :
                                        Array.isArray(tableExampleData?.Items) ? <>
                                            <IcCheck fontSize={'inherit'} style={{verticalAlign: 'text-bottom'}}/>
                                            {' configured ('}
                                            {tableExampleData.Items.length}{' entries)'}
                                        </> : 'invalid, Items must be array'
                                    : 'missing'
                            }</Typography>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails
                        style={{flexWrap: 'wrap', display: 'flex'}}
                    >
                        <InputTextJson
                            label={'Data as JSON'}
                            value={tableExampleData}
                            onChange={(newValue) => {
                                updateTables((t: any) => ({...t, exampleData: newValue}), activeTable)
                            }}
                        />
                        <Button size={'small'} style={{marginTop: 4}}>save</Button>
                    </AccordionDetails>
                </Accordion>
            </Box> :
            <Alert severity={'error'}>Table not found in localStorage.</Alert>}
    </Box>
}
