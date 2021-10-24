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
import { useDynamoTables } from '../feature/DynamoTables'

export const DynamoTableMeta = (
    {
        activeTable,
    }: {
        activeTable: string | undefined
    }
) => {
    const {tableDetails, save} = useDynamoTables()
    const table = activeTable ? tableDetails.get(activeTable) : undefined
    const [openId, setOpenId] = React.useState<string | undefined>(undefined)
    const tableSchema = table?.schema
    const tableExampleData = table?.exampleData

    return <Box m={2} style={{
        flexGrow: 1, overflow: 'auto', display: 'flex',
        flexDirection: 'column', alignContent: 'flex-start',
    }}>
        <Typography variant={'h1'} gutterBottom>
            Table Config: <code>{table?.meta?.name || activeTable}</code>
        </Typography>

        {table ?
            <Box style={{display: 'flex', flexDirection: 'column', overflow: 'auto', flexGrow: 1}} my={2}>
                <Accordion
                    expanded={openId === 'schema'} onChange={() => setOpenId(id => id === 'schema' ? undefined : 'schema')}
                    style={{
                        display: 'flex', flexDirection: 'column',
                        overflowY: openId === 'schema' ? 'auto' : 'hidden',
                        overflowX: 'hidden',
                        flexShrink: openId === 'schema' ? 1 : 0,
                    }}
                    TransitionProps={{style: {overflowY: 'auto', overflowX: 'hidden'}, timeout: 0}}
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
                                tableSchema && !tableSchema?.schema?.Table ? 'invalid, Table not set' :
                                    tableSchema?.schema?.Table ? <>
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
                            value={tableSchema?.schema || {
                                Table: {
                                    TableName: '',
                                },
                            }}
                            onChange={(newValue) => {
                                if(!activeTable) return
                                save(activeTable, {
                                    schema: newValue
                                }).then()
                            }}
                        />
                        <Button size={'small'} style={{marginTop: 4}}>save</Button>
                    </AccordionDetails>
                </Accordion>
                <Accordion
                    expanded={openId === 'exampleData'} onChange={() => setOpenId(id => id === 'exampleData' ? undefined : 'exampleData')}
                    style={{
                        display: 'flex', flexDirection: 'column',
                        overflowY: openId === 'exampleData' ? 'auto' : 'hidden',
                        overflowX: 'hidden',
                        flexShrink: openId === 'exampleData' ? 1 : 0,
                        //overflow: 'auto',
                    }}
                    TransitionProps={{style: {overflowY: 'auto', overflowX: 'hidden'}, timeout: 0}}
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
                                    !tableExampleData?.example_items?.Items ? 'invalid, Items not set' :
                                        Array.isArray(tableExampleData?.example_items?.Items) ? <>
                                            <IcCheck fontSize={'inherit'} style={{verticalAlign: 'text-bottom'}}/>
                                            {' configured ('}
                                            {tableExampleData.example_items?.Items.length}{' entries)'}
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
                            value={tableExampleData?.example_items || {'Items': []}}
                            onChange={(newValue) => {
                                if(!activeTable) return
                                save(activeTable, {
                                    exampleData: newValue
                                }).then()
                            }}
                        />
                        <Button size={'small'} style={{marginTop: 4}}>save</Button>
                    </AccordionDetails>
                </Accordion>
            </Box> :
            <Alert severity={'error'}>Table not found.</Alert>}
    </Box>
}
