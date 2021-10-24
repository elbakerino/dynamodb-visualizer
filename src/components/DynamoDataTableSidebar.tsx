import React from 'react'
import Box from '@material-ui/core/Box'
import { ColorizeRulesetType, SidebarColorize } from './DataTableSidebar/Colorize'
import { Paper } from '@material-ui/core'
import { SidebarFilterPresets } from './DataTableSidebar/FilterPresets'
import { ParsedDataResult } from './DynamoDataTable'

export const DynamoDataTableSidebar: React.ComponentType<{
    openId: string
    activeTable: string | undefined
    setRuleset: React.Dispatch<React.SetStateAction<ColorizeRulesetType>>
    setOpenSidebar: (key: string | undefined | ((key: string | undefined) => string | undefined)) => void
    parsedData: ParsedDataResult | undefined
    toggleDisplayKeys: (key: string) => void
    activePreset: string | undefined
    activeColor: string | undefined
}> = ({
          openId, setOpenSidebar,
          activeTable,
          setRuleset,
          parsedData,
          toggleDisplayKeys, activePreset,
          activeColor,
      }) => {
    return <Paper
        style={{width: '26%', minWidth: 310, flexShrink: 0, borderTop: 0, overflow: 'auto'}}
        variant={'outlined'}
    >
        <Box m={2}>
            {openId === 'colorize' ?
                <SidebarColorize
                    setRuleset={setRuleset}
                    setOpenSidebar={setOpenSidebar}
                    activeTable={activeTable}
                    activePreset={activePreset}
                    activeColor={activeColor}
                    activeIndex={parsedData?.indexName}
                /> :
                openId === 'filter' ?
                    <SidebarFilterPresets
                        setOpenSidebar={setOpenSidebar}
                        activeTable={activeTable}
                        activeColor={activeColor}
                        parsedData={parsedData}
                        toggleDisplayKeys={toggleDisplayKeys}
                        activePreset={activePreset}
                    /> : 'No sidebar content for: ' + openId}
        </Box>
    </Paper>
}
