import { Badge, Box, IconButton, LinearProgress, Paper, TextField } from '@material-ui/core'
import React, { memo } from 'react'
import { parseExampleData } from './parseExampleData'
import IcFilterPreset from '@material-ui/icons/BlurLinear'
import IcScan from '@material-ui/icons/SearchOutlined'
import IcFixedWidth from '@material-ui/icons/GridOff'
import IcFlexWidth from '@material-ui/icons/GridOn'
import { DynamoDataTableSecondaryKeys } from './DynamoDataTableSecondaryKeys'
import { useHistory, useLocation } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import { DynamoDataTableSidebar } from './DynamoDataTableSidebar'
import { ColorizeContext, ColorizeRulesetType } from './DataTableSidebar/Colorize'
import { DynamoDbKeyIndex, useDynamoTables } from '../feature/DynamoTables'
import { useExplorerContext } from '../feature/ExplorerContext'
import { buildSearch, parseParams } from '../lib/SearchParams'
import { DynamoDataTableContent } from './DynamoDataTableContent'
import IcColorize from '@material-ui/icons/ColorLens'
import { usePageTable } from './PageDynamoTable'

export interface DynamoPreset {
    name: string
    displayKeys: string[]
}

export type DynamoPresets = DynamoPreset[]

export interface DynamoExplorer {
    name?: string
    endpoint: string
}

export type DynamoExplorers = DynamoExplorer[]

export interface ParsedDataResult {
    index?: [DynamoDbKeyIndex] | [DynamoDbKeyIndex, DynamoDbKeyIndex]
    indexName?: string | undefined
    sorted?: { [k: string]: { [k2: 'S' | 'N' | string]: string }[] }
    allKeys?: string[]
    displayKeys?: string[]
    presetKeys?: string[] | undefined
}

const DynamoDataTableBase = () => {
    const {activeTable} = usePageTable()
    const [ruleSet, setRuleset] = React.useState<ColorizeRulesetType>({pk: [], sk: []})
    const [openSidebar, setOpenSidebar] = React.useState<string | undefined>(undefined)
    const [scanEndpoint, setScanEndpoint] = React.useState<string>('')
    const [fixedWidth, setFixedWidth] = React.useState<boolean>(false)
    const [parsing, setParsing] = React.useState<number>(0)
    const [parsedData, setParsedData] = React.useState<ParsedDataResult | undefined>(undefined)
    const history = useHistory()
    const location = useLocation()
    const searchParams = parseParams(location.search)
    const [activeIndex, setActiveIndex] = React.useState<string | undefined>(searchParams?.key_index)
    const paramIndex = searchParams?.key_index
    React.useEffect(() => {
        setActiveIndex(paramIndex || undefined)
    }, [paramIndex, setActiveIndex])
    const [scanProgress, setScanProgress] = React.useState<number>(0)
    const [scanData, setScanData] = React.useState<any | undefined>(undefined)
    const {tableDetails} = useDynamoTables()
    const {id} = useExplorerContext()
    const table = activeTable ? tableDetails.get(activeTable) : undefined
    const tableSchema = table?.schema?.schema
    const tableData = scanData || table?.exampleData?.example_items
    const tableSchemaPrimaryIndex = tableSchema?.Table?.KeySchema
    const tableSchemaSecIndex = tableSchema?.Table?.GlobalSecondaryIndexes

    const presets = table?.presets
    const paramPresetTmp = searchParams?.preset ? decodeURIComponent(searchParams?.preset) : undefined
    const presetData = paramPresetTmp && presets ? presets.find(p => p.data_key === 'v0#preset#' + encodeURIComponent(paramPresetTmp)) : undefined
    const paramPreset = presetData ? paramPresetTmp : undefined

    const colors = table?.colors
    const paramColorTmp = searchParams?.color ? decodeURIComponent(searchParams?.color) : undefined
    const colorData = paramColorTmp && colors ? colors.find(p => p.data_key === 'v0#color#' + encodeURIComponent(paramColorTmp)) : undefined
    const paramColor = colorData ? paramColorTmp : undefined

    const changeActiveIndex = React.useCallback((ix: string | undefined) => {
        history.push({
            search: buildSearch([
                ix ? 'key_index=' + ix : undefined,
                id ? 'explorer=' + encodeURIComponent(id) : undefined,
                paramColor ? 'color=' + encodeURIComponent(paramColor) : undefined,
                paramPreset ? 'preset=' + encodeURIComponent(paramPreset) : undefined,
            ])
        })
    }, [history, id, paramColor, paramPreset])

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

    let index = tableSchemaPrimaryIndex
    if(activeIndex) {
        // todo find and overwrite secondary
        index = tableSchemaSecIndex?.find((index: any) => index.IndexName === activeIndex)?.KeySchema
    }

    React.useEffect(() => {
        if(!presetData) return
        setParsedData((pd) => ({
            ...(pd || {}),
            displayKeys: presetData.display_keys ? presetData.display_keys : pd?.allKeys,
            presetKeys: presetData.display_keys,
        }))
    }, [presetData, setParsedData])

    React.useEffect(() => {
        setRuleset(() => ({
            pk: colorData?.color_pk || [],
            sk: colorData?.color_sk || [],
        }))
    }, [colorData, setRuleset])

    React.useEffect(() => {
        if(!tableData?.Items || !index) {
            //setParsedData(undefined)
            return
        }
        const i = index
        const ai = activeIndex
        const items = tableData?.Items
        setParsing(1)
        // @ts-ignore
        setParsedData(pd => ({presetKeys: pd?.presetKeys}))
        // timeout for: heavy CPU load operation that blocks the setParsing re-rendering
        const timer = window.setTimeout(() => {
            const parsed = parseExampleData(i, items)

            const allKeys = parsed.allKeys.sort((a, b) => {
                return a.localeCompare(b)
            })

            setParsedData(pd => ({
                index: i,
                indexName: ai,
                sorted: parsed.sorted,
                allKeys: [...allKeys],
                displayKeys: pd?.presetKeys ? pd.presetKeys : [...allKeys],
                presetKeys: pd?.presetKeys,
            }))
            setParsing(2)
        }, 20)

        return () => {
            setParsing(0)
            window.clearTimeout(timer)
        }
    }, [
        index, activeIndex,
        setParsedData, tableData,
        tableSchemaPrimaryIndex, tableSchemaSecIndex,
    ])

    const toggleDisplayKeys = React.useCallback((key: string) => {
        setParsedData(pd => {
            if(!pd) return pd
            const dks = [...pd.displayKeys || []]
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

    return <ColorizeContext.Provider value={ruleSet}>
        <Box m={2}>
            <Box style={{
                display: 'flex',
                overflow: 'auto',
            }}>
                <Paper
                    variant={'outlined'}
                    style={{
                        marginRight: 'auto',
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

                <Box
                    mt={'auto'} mr={1} ml={1} mb={'auto'}
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
                            edge="start" color={'inherit'} aria-label="do scan"
                            disabled={
                                !scanEndpoint || !tableSchema?.Table?.TableName || scanProgress === 1
                            }
                            onClick={() => scanEndpoint && tableSchema?.Table?.TableName ? doScan(scanEndpoint, tableSchema?.Table?.TableName) : null}
                            style={{
                                margin: 'auto 0 0 0',
                                padding: '6px 6px 0 6px',
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
                    size={'small'}
                    onClick={() => setOpenSidebar(id => id === 'colorize' ? undefined : 'colorize')}
                    style={{
                        margin: 'auto 0',
                        padding: 6,
                    }}
                >
                    <Badge
                        color="primary" variant="dot"
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        badgeContent={' '}
                        invisible={!Boolean(paramColor)}
                    >
                        <IcColorize/>
                    </Badge>
                </IconButton>

                <IconButton
                    edge="start" color="inherit" aria-label="filter presets"
                    onClick={() => setOpenSidebar(o => o === 'filter' ? undefined : 'filter')}
                    style={{
                        margin: 'auto 0',
                        padding: 6,
                    }}
                >
                    <Badge
                        color="primary" variant="dot"
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        badgeContent={' '}
                        invisible={!Boolean(paramPreset)}
                    >
                        <IcFilterPreset/>
                    </Badge>
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
            </Box>

            <DynamoDataTableSecondaryKeys
                tableSchemaSecIndex={tableSchemaSecIndex}
                openId={'viz'}
                activeIndex={activeIndex}
                setActiveIndex={changeActiveIndex}
            />
        </Box>
        <Box style={{display: 'flex', overflow: 'auto', flexGrow: 1}}>
            {parsing === 0 || !index ? <Box m={2} style={{flexGrow: 1}}>nothing parsed</Box> :
                parsing === 1 || (
                    parsing === 2 &&
                    !(parsedData?.sorted && index && index === parsedData.index)
                ) ? <Box m={2} style={{flexGrow: 1}}>parsing...</Box> :
                    <DynamoDataTableContent
                        toggleDisplayKeys={toggleDisplayKeys}
                        parsedData={parsedData}
                        index={index}
                        setOpenSidebar={setOpenSidebar}
                        fixedWidth={fixedWidth}
                    />}

            {openSidebar ? <DynamoDataTableSidebar
                activeTable={activeTable}
                activeColor={paramColor}
                openId={openSidebar}
                setOpenSidebar={setOpenSidebar}
                setRuleset={setRuleset}
                parsedData={parsedData}
                toggleDisplayKeys={toggleDisplayKeys}
                activePreset={paramPreset}
            /> : null}
        </Box>
    </ColorizeContext.Provider>
}

export const DynamoDataTable = memo(DynamoDataTableBase)
