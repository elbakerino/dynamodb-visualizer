import React, { memo } from 'react'
import { areEqual, FixedSizeList } from 'react-window'
import { Box, Button } from '@material-ui/core'
import { useIcon1Actions, useIcon1, Icon1ProviderIconList, Icon1ProviderIconListItem } from '../lib/Icon1Provider'
import { IconEmbed } from './IconEmbed'
import Skeleton from '@material-ui/lab/Skeleton'

export interface IconPickerBaseProps {
    provider: string
    selected: string | undefined
    rowSize?: number
    search?: string
    width?: number
    onSelect: (icon: Icon1ProviderIconListItem) => void
}

export const IconPickerBase: React.ComponentType<IconPickerBaseProps> = (
    {
        provider,
        rowSize = 6,
        onSelect,
        selected,
        search,
        width = 240,
    }
) => {
    const {icons} = useIcon1()
    const {listIcons} = useIcon1Actions()

    React.useEffect(() => {
        listIcons(provider)
    }, [listIcons, provider])

    const iconSet = icons[provider]

    const filteredIconSet = React.useMemo(() => {
        if(typeof search === 'undefined' || search.trim() === '') {
            return iconSet
        }
        const s = search.toLowerCase()
        const fl = iconSet.list.filter(i => {
            const id = i.id.toLowerCase()
            const title = (i.title || '').toLowerCase()
            return id === s || title === s ||
                id.indexOf(s) === 0 || title.indexOf(s) === 0
        })
        return {
            total: fl.length,
            list: fl,
        }
    }, [search, iconSet])

    const itemData = React.useMemo(() => ({
        rowSize: rowSize,
        iconSet: filteredIconSet || {},
        onSelect: onSelect,
        selected: selected,
        provider: provider,
    }), [
        rowSize,
        filteredIconSet,
        onSelect,
        selected,
        provider,
    ])

    return filteredIconSet ?
        <FixedSizeList
            itemCount={Number((filteredIconSet.total / rowSize).toFixed(0)) || 1}
            height={220}
            width={240}
            itemSize={width / rowSize}
            itemData={itemData}
        >
            {Row}
        </FixedSizeList> : <>
            <Skeleton variant="rect" animation="wave" width={240} height={30} style={{margin: '8px 0 4px 0'}}/>
            <Skeleton variant="rect" animation="wave" width={240} height={30} style={{margin: '8px 0 4px 0'}}/>
            <Skeleton variant="rect" animation="wave" width={240} height={30} style={{margin: '8px 0 4px 0'}}/>
            <Skeleton variant="rect" animation="wave" width={240} height={30} style={{margin: '8px 0 4px 0'}}/>
        </>
}

// @ts-ignore
const Row = memo(({data, index, style}) => {
    // Data passed to List as "itemData" is available as props.data
    const {rowSize, onSelect, selected} = data
    const iconSet = data.iconSet as Icon1ProviderIconList | undefined
    //const item = items[index]
    const is = iconSet?.list?.slice(index * rowSize, (index * rowSize) + rowSize)

    return <Box mb={2} style={style}>
        {is?.map((i, j) =>
            <RowItem
                key={j}
                cellIndex={j}
                onSelect={onSelect}
                icon={i}
                selected={selected === i.id}
            />
        )}
    </Box>
}, areEqual)

const RowItemBase: React.ComponentType<{
    onSelect: IconPickerBaseProps['onSelect']
    icon: Icon1ProviderIconListItem
    selected: boolean
    cellIndex: number
}> = (
    {
        icon,
        onSelect, selected,
    }
) => {
    return <Button
        onClick={() => {
            onSelect(icon)
        }}
        variant={selected ? 'outlined' : undefined}
        color={selected ? 'primary' : 'default'}
        style={{
            minWidth: 30,
            borderWidth: 1,
            borderColor: selected ? undefined : 'transparent',
            borderStyle: 'solid',
            padding: 0,
        }}
    >
        <IconEmbed
            fontSize={'large'}
            provider={icon.provider} id={icon.id}
            title={icon.title}
            color={'inherit'}
        />
    </Button>
}
const RowItem = memo(RowItemBase)

export const IconPicker = memo(IconPickerBase)
