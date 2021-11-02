import { Table, TableBody, TableCell, TableContainer, TableRow } from '@material-ui/core'
import React, { memo } from 'react'
import { ColorizeRule, useColorize } from './DataTableSidebar/Colorize'
import { DynamoDataTableHead } from './DynamoDataTableHead'
import { ParsedDataResult } from './DynamoDataTable'
import { DynamoDbKeyIndex } from '../feature/DynamoTables'

const DataTableBase = (
    {
        parsedData, index,
        toggleDisplayKeys,
        setOpenSidebar,
        fixedWidth,
    }: {
        parsedData: ParsedDataResult | undefined
        index: [DynamoDbKeyIndex] | [DynamoDbKeyIndex, DynamoDbKeyIndex]
        toggleDisplayKeys: (key: string) => void
        setOpenSidebar: (key: string | ((key: string | undefined) => string | undefined)) => void
        fixedWidth: boolean
    }
) => {
    return <TableContainer style={{maxHeight: '100vh'}}>
        <Table size={'small'} style={{tableLayout: fixedWidth ? 'fixed' : undefined}}>
            <DynamoDataTableHead parsedData={parsedData} index={index} toggleDisplayKeys={toggleDisplayKeys} setOpenSidebar={setOpenSidebar}/>

            <TableBody>
                {parsedData && Object.keys(parsedData.sorted || {}).map((pk) =>
                    <DataTableRowContainer
                        key={pk}
                        pk={pk}
                        sorted={parsedData.sorted}
                        displayKeys={parsedData.displayKeys}
                        index={index}
                    />
                )}
            </TableBody>
        </Table>
    </TableContainer>
}
export const DynamoDataTableContent = memo(DataTableBase)

const DataTableRowContainer: React.ComponentType<{
    pk: string
    sorted: ParsedDataResult['sorted']
    displayKeys: ParsedDataResult['displayKeys']
    index: [DynamoDbKeyIndex] | [DynamoDbKeyIndex, DynamoDbKeyIndex]
}> = ({pk, sorted, displayKeys, index}) => {
    const colorize = useColorize()
    const pkColor = getNamedColor(pk, colorize.pk)
    return <React.Fragment key={pk}>
        <TableRow>
            <TableCell
                style={{
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    ...(pkColor ? {background: pkColor} : {}),
                }}
                rowSpan={(sorted && sorted[pk] ? sorted[pk].length : 0) + 1}
            >{pk}</TableCell>
        </TableRow>
        {sorted && sorted[pk]?.map((sk: any, i: number) =>
            <DataTableRow
                key={i}
                index={index}
                sk={sk}
                pkColor={pkColor}
                skRule={colorize.sk}
                displayKeys={displayKeys}
            />
        )}
    </React.Fragment>
}

// @ts-ignore
const DataTableRowBase = ({index, sk, pkColor, skRule, displayKeys}) => {
    displayKeys = displayKeys?.filter((k: string) =>
        k !== (index[0] ? index[0].AttributeName : '') && k !== (index[1] ? index[1].AttributeName : '')
    )
    const skVal = index[1] ? Object.values(sk[index[1].AttributeName])[0] as string : undefined
    const skColor = getNamedColor(skVal, skRule)
    return <TableRow
        style={{
            ...(pkColor || skColor ? {background: skColor || pkColor} : {}),
        }}
    >
        {index[1] ? <TableCell
            style={{
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                ...(skColor ? {background: skColor} : {}),
            }}
        >{skVal}</TableCell> : null}
        {displayKeys?.map((ik: string) =>
            <DataTableCell key={ik} ik={ik} sk={sk}/>
        )}
    </TableRow>
}
const DataTableRow = memo(DataTableRowBase)

function getNamedColor(value: any, rules: ColorizeRule[]) {
    if(!rules || typeof value === 'undefined') {
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

const DataTableCellBase = (
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

const DataTableCell = memo(DataTableCellBase)
