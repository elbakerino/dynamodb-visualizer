import React from 'react'
import Box from '@material-ui/core/Box'
import { ColorizeRulesetType, SidebarColorize } from './DataTableSidebar/Colorize'
import { Paper } from '@material-ui/core'

export const DynamoTableSidebar: React.ComponentType<{
    openId: string
    ruleSet: ColorizeRulesetType
    setRuleset: React.Dispatch<React.SetStateAction<ColorizeRulesetType>>
    setOpenSidebar: (key: string | undefined | ((key: string | undefined) => string | undefined)) => void
}> = ({
          openId, setOpenSidebar,
          ruleSet, setRuleset,
      }) => {
    return <Paper
        style={{width: '26%', minWidth: 310, flexShrink: 0, borderTop: 0, overflow: 'auto'}}
        variant={'outlined'}
    >
        <Box m={2}>
            {openId === 'colorize' ?
                <SidebarColorize
                    ruleSet={ruleSet}
                    setRuleset={setRuleset}
                    setOpenSidebar={setOpenSidebar}
                /> : null}
        </Box>
    </Paper>
}
