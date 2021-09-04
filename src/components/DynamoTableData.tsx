import { Box, IconButton, LinearProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, useTheme } from '@material-ui/core'
import React, { memo } from 'react'
import { parseExampleData } from './parseExampleData'
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab'
import IcConfig from '@material-ui/icons/Settings'
import IcScan from '@material-ui/icons/SearchOutlined'
import IcVisibilityOff from '@material-ui/icons/VisibilityOff'
import { DynamoTableDataConfig } from './DynamoTableDataConfig'
import { DynamoTableDataInfo } from './DynamoTableDataInfo'
import { DynamoTableDataSecondaryKeys } from './DynamoTableDataSecondaryKeys'
import { useHistory } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'

export interface DynamoDbIndex {
    AttributeName: string
    KeyType: string
}

export interface ParsedDataResult {
    index: DynamoDbIndex
    sorted: { [k: string]: { [k2: 'S' | 'N' | string]: string }[] }
    allKeys: string[]
    displayKeys: string[]
}

const DynamoTableDataBase = (
    {
        tables,
        activeTable,
    }: {
        tables: any[]
        activeTable: string | undefined
    }
) => {
    const [openId, setOpenId] = React.useState<string | undefined>('viz')
    const [scanEndpoint, setScanEndpoint] = React.useState<string>('')
    const [openConfig, setOpenConfig] = React.useState<boolean>(false)
    const [parsing, setParsing] = React.useState<number>(0)
    const [parsedData, setParsedData] = React.useState<ParsedDataResult | undefined>(undefined)
    const history = useHistory()
    const searchParams: { [k: string]: string } = history.location.search ?
        history.location.search
            .substr(1)
            .split('&')
            .reduce((a: { [k: string]: string }, b) => {
                const ks = b.split('=')
                a[ks[0] as string] = ks[1]
                return a
            }, {})
        : {}

    const [activeIndex, setActiveIndex] = React.useState<string | undefined>(searchParams?.key_index)
    const [scanProgress, setScanProgress] = React.useState<number>(0)
    const [scanData, setScanData] = React.useState<any | undefined>(undefined)
    const table = tables.find(t => t.id === activeTable)
    const tableSchema = table?.schema
    const tableData = scanData || table?.exampleData
    const tableSchemaAttr = table?.schema?.Table?.AttributeDefinitions
    const tableSchemaKeyIndex = table?.schema?.Table?.KeySchema
    const tableSchemaSecIndex = table?.schema?.Table?.GlobalSecondaryIndexes

    const changeActiveIndex = React.useCallback((ix: string | undefined) => {
        setActiveIndex(ix)
        history.replace({
            search: ix ? '?key_index=' + ix : ''
        })
    }, [setActiveIndex, history])

    const doScan = React.useCallback((scanUrl: string, tableId: string) => {
        setScanProgress(1)
        if(scanUrl.indexOf('?') === -1) {
            scanUrl += '?table=' + tableId
        } else {
            scanUrl += '&table=' + tableId
        }
        fetch(scanUrl, {method: 'GET'})
            .then(async(r) => ({
                status: r.status,
                json: await r.json(),
            }))
            .then(j => {
                if(j.status === 200) {
                    setScanData(j.json)
                    setScanProgress(2)
                } else {
                    setScanProgress(3)
                }
            })
            .catch((e) => {
                setScanProgress(3)
                console.error('scan error:', e)
            })
    }, [setScanData, setScanProgress])

    let index = tableSchemaKeyIndex
    if(activeIndex) {
        // todo find and overwrite secondary
        index = tableSchemaSecIndex?.find((index: any) => index.IndexName === activeIndex)?.KeySchema
    }
    React.useEffect(() => {
        if(!tableData?.Items) {
            setParsedData(undefined)
            return
        }

        setParsing(1)
        setParsedData(undefined)

        const parsed = parseExampleData(index, tableData.Items)

        const allKeys = parsed.allKeys.sort((a, b) => {
            return a.localeCompare(b)
        })

        setParsedData({
            index: index,
            sorted: parsed.sorted,
            allKeys: [...allKeys],
            displayKeys: [...allKeys],
        })
        setParsing(2)

    }, [
        index,
        setParsedData, tableData,
        tableSchemaAttr, tableSchemaAttr,
        tableSchemaKeyIndex, tableSchemaSecIndex,
    ])

    const toggleDisplayKeys = React.useCallback((key: string) => {
        setParsedData(pd => {
            if(!pd) return pd
            const dks = [...pd.displayKeys]
            const ix = dks.indexOf(key)
            if(typeof ix === 'undefined' || ix === -1) {
                dks.push(key)
            } else {
                dks.splice(ix, 1)
            }
            return {
                ...pd,
                displayKeys: dks.sort((a, b) => a.localeCompare(b)),
            }
        })
    }, [setParsedData])

    return <>
        <Box m={2}>
            <Box style={{
                display: 'flex',
                overflow: 'auto',
            }}>
                <ToggleButtonGroup
                    value={openId}
                    exclusive
                    size={'small'}
                    onChange={(e, val) =>
                        val ?
                            setOpenId(val) :
                            setOpenId(openId || 'config')
                    }
                >
                    <ToggleButton value="info" style={{whiteSpace: 'nowrap'}}>
                        Show Info
                    </ToggleButton>
                    <ToggleButton value="viz" style={{whiteSpace: 'nowrap'}}>
                        Open Table
                    </ToggleButton>
                </ToggleButtonGroup>
                {openId !== 'info' ? <>
                    <Paper
                        variant={'outlined'}
                        style={{
                            marginLeft: 6,
                            marginRight: 6,
                            background: typeof activeIndex === 'undefined' ? undefined : 'transparent',
                            fontWeight: typeof activeIndex === 'undefined' ? 'bold' : 'normal',
                            cursor: 'pointer',
                            display: 'inline-flex'
                        }}
                        tabIndex={-1}
                        onClick={() => changeActiveIndex(undefined)}
                    >
                        <Box my={'auto'} mx={1} style={{whiteSpace: 'nowrap'}}>
                            primary index
                        </Box>
                    </Paper>

                    <Box mt={'auto'} mr={1} ml={'auto'} mb={'auto'} style={{display: 'flex', flexDirection: 'column', position: 'relative'}}>
                        <Box style={{display: 'flex'}}>
                            <TextField
                                label={'Scan Endpoint'}
                                value={scanEndpoint}
                                onChange={(e) => setScanEndpoint(e.target.value)}
                                size={'small'}
                                fullWidth
                                style={{minWidth: 350}}
                            />
                            <IconButton
                                edge="start" color={'inherit'} aria-label="config"
                                disabled={
                                    !scanEndpoint || !tableSchema?.Table?.TableName || scanProgress === 1
                                }
                                onClick={() => scanEndpoint && tableSchema?.Table?.TableName ? doScan(scanEndpoint, tableSchema?.Table?.TableName) : null}
                                style={{
                                    margin: 'auto 0',
                                    padding: 6,
                                }}
                            >
                                <IcScan color={scanProgress === 3 ? 'error' : 'inherit'}/>
                            </IconButton>
                        </Box>

                        {!tableSchema?.Table?.TableName ?
                            <Typography variant={'caption'} color={'error'}>tableSchema is missing `Table.TableName`</Typography> : null}

                        {scanProgress === 1 ? <LinearProgress style={{position: 'absolute', bottom: 0, left: 0, right: 0}}/> : null}
                    </Box>

                    <IconButton
                        edge="start" color="inherit" aria-label="config"
                        onClick={() => setOpenConfig(o => !o)}
                        style={{
                            margin: 'auto 0',
                            padding: 6,
                        }}
                    >
                        <IcConfig/>
                    </IconButton>
                </> : null}
            </Box>

            {openId === 'viz' ? <DynamoTableDataConfig
                open={openConfig} onClose={() => setOpenConfig(false)}
                arrayKeys={parsedData?.allKeys}
                displayKeys={parsedData?.displayKeys}
                index={index}
                setParsedData={setParsedData}
                toggleDisplayKeys={toggleDisplayKeys}
            /> : null}

            {openId === 'info' ? <DynamoTableDataInfo
                tableSchema={tableSchema}
                activeTable={activeTable}
                setActiveIndex={changeActiveIndex}
                activeIndex={activeIndex}
                tableSchemaKeyIndex={tableSchemaKeyIndex}
            /> : null}

            <DynamoTableDataSecondaryKeys
                tableSchemaSecIndex={tableSchemaSecIndex}
                openId={openId}
                activeIndex={activeIndex}
                setActiveIndex={changeActiveIndex}
            />
        </Box>

        {openId === 'viz' ?
            parsing === 0 ? <Box m={2}>nothing parsed</Box> :
                parsing === 1 || (
                    parsing === 2 &&
                    !(parsedData?.sorted && index && index === parsedData.index)
                ) ? <Box m={2}>parsing...</Box> :
                    <DataTable
                        toggleDisplayKeys={toggleDisplayKeys}
                        parsedData={parsedData}
                        index={index}
                    /> :
            null}
    </>
}

const DataTableBase = (
    {
        parsedData, index,
        toggleDisplayKeys,
    }: {
        parsedData: any
        index: any[]
        toggleDisplayKeys: (key: string) => void
    }
) => {
    return <TableContainer style={{maxHeight: '100vh'}}>
        <Table size={'small'}>
            <DataTableHead parsedData={parsedData} index={index} toggleDisplayKeys={toggleDisplayKeys}/>

            <TableBody>
                {Object.keys(parsedData.sorted).map((k) => <React.Fragment key={k}>
                    <TableRow>
                        <TableCell style={{whiteSpace: 'nowrap'}} rowSpan={(parsedData.sorted[k]?.length || 0) + 1}>{k}</TableCell>
                    </TableRow>
                    {parsedData.sorted[k]?.map((sk: any, i: number) => <TableRow key={i}>
                        <TableCell style={{whiteSpace: 'nowrap'}}>{Object.values(sk[index[1].AttributeName])[0] as string}</TableCell>
                        {parsedData.displayKeys.map((ik: string) =>
                            <DataTableCell key={ik} ik={ik} sk={sk}/>
                        )}
                    </TableRow>)}
                </React.Fragment>)}
            </TableBody>
        </Table>
    </TableContainer>
}
const DataTable = memo(DataTableBase)

const DataTableCell = (
    {
        sk, ik
    }: {
        sk: any
        ik: string
    }
) => {
    const [showAll, setShowAll] = React.useState<boolean>(false)
    const val = sk[ik] ? Object.values(sk[ik])[0] as string : undefined
    React.useEffect(() => {
        setShowAll(false)
    }, [val, setShowAll])
    return <TableCell
        style={{
            whiteSpace: showAll ? 'normal' : 'nowrap',
            overflow: 'hidden',
            maxWidth: 450,
            textOverflow: 'ellipsis',
        }}
        onClick={() => setShowAll(o => !o)}
    >
        {sk[ik] ?
            typeof val === 'object' ? JSON.stringify(val) : val
            : <span style={{opacity: 0.5}}>-</span>}
    </TableCell>
}

const DataTableHead = (
    {
        parsedData, index,
        toggleDisplayKeys,
    }: {
        parsedData: any
        index: any[]
        toggleDisplayKeys: (key: string) => void
    }
) => {
    const theme = useTheme()
    return <TableHead style={{
        position: 'sticky',
        top: 0,
        background: theme.palette.background.paper,
    }}>
        <TableRow>
            <TableCell component={'th'} style={{fontWeight: 'bold'}}>{index[0].AttributeName}</TableCell>
            <TableCell component={'th'} style={{fontWeight: 'bold'}}>{index[1].AttributeName}</TableCell>
            {parsedData.displayKeys.map((k: string) => <TableCell
                key={k}
                component={'th'}
                style={{paddingRight: 6}}
            >
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <span style={{fontWeight: 'bold', marginRight: 6}}>{k}</span>
                    <IconButton
                        size={'small'} style={{marginLeft: 4}}
                        onClick={() => toggleDisplayKeys(k)}
                    >
                        <IcVisibilityOff style={{padding: 4}}/>
                    </IconButton>
                </div>
            </TableCell>)}
        </TableRow>
    </TableHead>
}

export const DynamoTableData = memo(DynamoTableDataBase)
