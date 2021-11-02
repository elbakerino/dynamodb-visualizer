import { IconButton, TableCell, TableHead, TableRow, useTheme } from '@material-ui/core'
import React, { memo } from 'react'
import IcVisibilityOff from '@material-ui/icons/VisibilityOff'
import { ParsedDataResult } from './DynamoDataTable'
import { DynamoDbKeyIndex } from '../feature/DynamoTables'

const DataTableHeadCellBase: React.ComponentType<{
    name: string | undefined
    button?: React.ReactElement
}> = ({name, button}) => {
    const [hovering, setHovering] = React.useState<undefined | number>(undefined)
    return <TableCell
        component={'th'}
        style={{
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            width: hovering || 'auto',
        }}
        onMouseEnter={(e) => {
            setHovering(e.currentTarget.scrollWidth)
        }}
        onMouseLeave={() => setHovering(undefined)}
    >
        <div style={{display: 'flex', alignItems: 'center',}}>
            <span style={{fontWeight: 'bold', marginRight: 6}}>{name}</span>
            {button}
        </div>
    </TableCell>
}
const DataTableHeadCell = memo(DataTableHeadCellBase)

const StyledHead: React.ComponentType<React.PropsWithChildren<{}>> = ({children}) => {
    const theme = useTheme()
    return <TableHead style={{
        position: 'sticky',
        top: 0,
        background: theme.palette.background.paper,
    }}>
        {children}
    </TableHead>
}

const HeadGenericKeysBase: React.ComponentType<{
    displayKeys: ParsedDataResult['displayKeys'] | undefined
    index: [DynamoDbKeyIndex] | [DynamoDbKeyIndex, DynamoDbKeyIndex] | undefined
    toggleDisplayKeys: (key: string) => void
}> = ({displayKeys, toggleDisplayKeys, index}) => {
    displayKeys = displayKeys?.filter((k: string) =>
        !index || (k !== (index[0] ? index[0].AttributeName : '') && k !== (index[1] ? index[1].AttributeName : ''))
    )
    return <>
        {displayKeys && displayKeys.map((k: string) =>
            <DataTableHeadCell
                key={k}
                name={k}
                button={
                    <IconButton
                        size={'small'} style={{marginLeft: 4}}
                        onClick={() => toggleDisplayKeys(k)}
                    >
                        <IcVisibilityOff style={{padding: 4}}/>
                    </IconButton>
                }
            />)}
    </>
}
const HeadGenericKeys = memo(HeadGenericKeysBase)

const DataTableHeadBase = (
    {
        parsedData, index,
        toggleDisplayKeys,
    }: {
        parsedData: ParsedDataResult | undefined
        index: [DynamoDbKeyIndex] | [DynamoDbKeyIndex, DynamoDbKeyIndex] | undefined
        toggleDisplayKeys: (key: string) => void
        setOpenSidebar: (key: string | ((key: string | undefined) => string | undefined)) => void
    }
) => {
    return <StyledHead>
        <TableRow>
            {index && index[0] ? <DataTableHeadCell name={index[0].AttributeName}/> : null}
            {index && index[1] ? <DataTableHeadCell name={index[1].AttributeName}/> : null}

            <HeadGenericKeys
                displayKeys={parsedData?.displayKeys}
                toggleDisplayKeys={toggleDisplayKeys}
                index={index}
            />
        </TableRow>
    </StyledHead>
}
export const DynamoDataTableHead = memo(DataTableHeadBase)
