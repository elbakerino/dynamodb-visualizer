import { Box, FormControl, IconButton, InputLabel, LinearProgress, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, useTheme } from '@material-ui/core'
import React, { memo } from 'react'
import { parseExampleData } from './parseExampleData'
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab'
import IcConfig from '@material-ui/icons/Settings'
import IcScan from '@material-ui/icons/SearchOutlined'
import IcClear from '@material-ui/icons/Clear'
import IcColorize from '@material-ui/icons/ColorLens'
import IcVisibilityOff from '@material-ui/icons/VisibilityOff'
import IcFixedWidth from '@material-ui/icons/GridOff'
import IcFlexWidth from '@material-ui/icons/GridOn'
import { DynamoTableDataConfig } from './DynamoTableDataConfig'
import { DynamoTableDataInfo } from './DynamoTableDataInfo'
import { DynamoTableDataSecondaryKeys } from './DynamoTableDataSecondaryKeys'
import { useHistory, useLocation } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import { getLocalPresets, setLocalPreset } from './Visualizer'
import { ColorizeRule, ColorizeRulesetType, DynamoTableSidebar } from './DynamoTableSidebar'

export interface DynamoPreset {
    name: string
    displayKeys: string[]
}

export type DynamoPresets = DynamoPreset[]

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
    const [ruleSet, setRuleset] = React.useState<ColorizeRulesetType>({pk: [], sk: []})
    const [openSidebar, setOpenSidebar] = React.useState<string | undefined>(undefined)
    const [scanEndpoint, setScanEndpoint] = React.useState<string>('')
    const [presets, setPresets] = React.useState<DynamoPresets>(activeTable ? getLocalPresets(activeTable) : [])
    const [openConfig, setOpenConfig] = React.useState<boolean>(false)
    const [fixedWidth, setFixedWidth] = React.useState<boolean>(false)
    const [parsing, setParsing] = React.useState<number>(0)
    const [parsedData, setParsedData] = React.useState<ParsedDataResult | undefined>(undefined)
    const history = useHistory()
    const location = useLocation()
    const searchParams: { [k: string]: string } = location.search ?
        location.search
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
    const paramPresetTmp = searchParams?.preset ? decodeURIComponent(searchParams?.preset) : undefined
    const presetExists = paramPresetTmp && presets.find(p => p.name === paramPresetTmp)
    const paramPreset = presetExists ? paramPresetTmp : undefined

    const savePreset: (table: string, name: string, displayKeys: string[]) => void = React.useCallback((table, name, displayKeys) => {
        setPresets(presets => {
            const ps = [...presets]
            const i = ps.findIndex(p => p.name === name)
            if(i === -1) {
                ps.push({name, displayKeys})
            } else {
                ps.splice(i, 1, {name, displayKeys})
            }
            setLocalPreset(table, ps)
            return ps
        })
        history.push({
            search: '?preset=' + encodeURIComponent(name)
        })
    }, [setPresets, history])

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
        if(activeTable) {
            setPresets(getLocalPresets(activeTable))
        } else {
            setPresets([])
        }
    }, [setPresets, activeTable])

    React.useEffect(() => {
        const preset = presets.find(p => p.name === paramPreset)
        setParsedData((pd) =>
            pd ? {
                ...pd,
                displayKeys: preset?.displayKeys ? preset.displayKeys : pd.allKeys
            } : pd
        )
    }, [presets, paramPreset, setParsedData])

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

                    {presets.length > 0 ? <Box
                        mt={'auto'} mr={1} ml={'auto'} mb={'auto'}
                        style={{display: 'flex', position: 'relative'}}
                    >
                        <FormControl fullWidth size={'small'} style={{minWidth: 120, marginRight: 1}}>
                            <InputLabel id={'bsv--preset'}>Preset</InputLabel>
                            <Select
                                labelId={'bsv--preset'}
                                id={'bsv--preset-val'}
                                value={paramPreset || ''}
                                onChange={(event: React.ChangeEvent<{ value: unknown }>) =>
                                    history.push({
                                        search: '?preset=' + encodeURIComponent(event.target.value as string) +
                                            (activeIndex ? '&key_index=' + activeIndex : '')
                                        ,
                                    })
                                }
                            >
                                {presets.map(p => <MenuItem key={p.name} value={p.name}>{p.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                        {paramPreset ? <IconButton
                            edge="start" color={'inherit'} aria-label="config"
                            onClick={() => history.push({
                                search: '',
                            })}
                            style={{
                                margin: 'auto 0',
                                padding: 6,
                            }}
                        >
                            <IcClear/>
                        </IconButton> : null}
                    </Box> : null}

                    <Box
                        mt={'auto'} mr={1}
                        ml={presets.length > 0 ? 1 : 'auto'}
                        mb={'auto'}
                        style={{display: 'flex', flexDirection: 'column', position: 'relative'}}
                    >
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

                    <IconButton
                        edge="start" color="inherit" aria-label="config"
                        onClick={() => setFixedWidth(o => !o)}
                        style={{
                            margin: 'auto 0',
                            padding: 6,
                        }}
                    >
                        {fixedWidth ?
                            <IcFixedWidth/> :
                            <IcFlexWidth/>}
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
                savePreset={savePreset}
                activeTable={activeTable}
                activePreset={paramPreset}
                presets={presets}
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
        <Box style={{display: 'flex', overflow: 'auto'}}>
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
                            setOpenSidebar={setOpenSidebar}
                            colorize={ruleSet}
                            fixedWidth={fixedWidth}
                        /> :
                null}

            {openSidebar ? <DynamoTableSidebar
                openId={openSidebar}
                ruleSet={ruleSet}
                setOpenSidebar={setOpenSidebar}
                setRuleset={setRuleset}
            /> : null}
        </Box>
    </>
}

const DataTableBase = (
    {
        parsedData, index,
        toggleDisplayKeys,
        setOpenSidebar,
        colorize,
        fixedWidth,
    }: {
        parsedData: any
        index: any[]
        toggleDisplayKeys: (key: string) => void
        setOpenSidebar: (key: string | ((key: string | undefined) => string | undefined)) => void
        colorize: ColorizeRulesetType
        fixedWidth: boolean
    }
) => {
    return <TableContainer style={{maxHeight: '100vh'}}>
        <Table size={'small'} style={{tableLayout: fixedWidth ? 'fixed' : undefined}}>
            <DataTableHead parsedData={parsedData} index={index} toggleDisplayKeys={toggleDisplayKeys} setOpenSidebar={setOpenSidebar}/>

            <TableBody>
                {Object.keys(parsedData.sorted).map((k) => <React.Fragment key={k}>
                    <TableRow>
                        <TableCell
                            style={{
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                ...(getColor(k, colorize.pk) ? {background: getColor(k, colorize.pk)} : {}),
                            }}
                            rowSpan={(parsedData.sorted[k]?.length || 0) + 1}
                        >{k}</TableCell>
                    </TableRow>
                    {parsedData.sorted[k]?.map((sk: any, i: number) => {
                        const skVal = Object.values(sk[index[1].AttributeName])[0] as string
                        const skColor = getColor(skVal, colorize.sk)
                        return <TableRow
                            key={i}
                            style={{
                                ...(getColor(k, colorize.pk) || skColor ? {background: skColor || getColor(k, colorize.pk)} : {}),
                            }}
                        >
                            <TableCell
                                style={{
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                    overflow: 'hidden',
                                    ...(skColor ? {background: skColor} : {}),
                                }}
                            >{skVal}</TableCell>
                            {parsedData.displayKeys.map((ik: string) =>
                                <DataTableCell key={ik} ik={ik} sk={sk}/>
                            )}
                        </TableRow>
                    })}
                </React.Fragment>)}
            </TableBody>
        </Table>
    </TableContainer>
}
const DataTable = memo(DataTableBase)

function getColor(value: any, rules: ColorizeRule[]) {
    if(!rules) {
        return undefined
    }
    return rules.reduce((match: string | undefined, rule): string | undefined => {
        if(match || !rule.color || !rule.comparison || rule.search === '' || typeof rule.search === 'undefined') {
            return match
        }
        switch(rule.comparison) {
            case '=':
                return value === rule.search ? rule.color : undefined
            case '≠':
                return value !== rule.search ? rule.color : undefined
            case '>':
                return value > rule.search ? rule.color : undefined
            case '<':
                return value < rule.search ? rule.color : undefined
            case '>=':
                return value >= rule.search ? rule.color : undefined
            case '<=':
                return value <= rule.search ? rule.color : undefined
            case 'begins_with':
                return typeof value === 'string' && value.indexOf(rule.search) === 0 ? rule.color : undefined
            case 'contains':
                return typeof value === 'string' && value.indexOf(rule.search) !== -1 ? rule.color : undefined
            case 'regex':
                break
        }
        return match
    }, undefined)
}

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
        setOpenSidebar,
    }: {
        parsedData: any
        index: any[]
        toggleDisplayKeys: (key: string) => void
        setOpenSidebar: (key: string | ((key: string | undefined) => string | undefined)) => void
    }
) => {
    const theme = useTheme()
    return <TableHead style={{
        position: 'sticky',
        top: 0,
        background: theme.palette.background.paper,
    }}>
        <TableRow>
            <TableCell component={'th'} style={{fontWeight: 'bold'}}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <span style={{fontWeight: 'bold', marginRight: 6}}>{index[0].AttributeName}</span>
                    <IconButton
                        size={'small'} style={{marginLeft: 4}}
                        onClick={() => setOpenSidebar(id => id === 'colorize' ? undefined : 'colorize')}
                    >
                        <IcColorize style={{padding: 4}}/>
                    </IconButton>
                </div>
            </TableCell>
            <TableCell component={'th'} style={{fontWeight: 'bold'}}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <span style={{fontWeight: 'bold', marginRight: 6}}>{index[1].AttributeName}</span>
                    <IconButton
                        size={'small'} style={{marginLeft: 4}}
                        onClick={() => setOpenSidebar(id => id === 'colorize' ? undefined : 'colorize')}
                    >
                        <IcColorize style={{padding: 4}}/>
                    </IconButton>
                </div>
            </TableCell>
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
