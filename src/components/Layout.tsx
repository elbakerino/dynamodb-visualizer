import React, { memo } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { AppBar, Box, IconButton, Toolbar, Typography } from '@material-ui/core'
import IcHome from '@material-ui/icons/Home'
import IcGitHub from '@material-ui/icons/GitHub'
import IcTheme from '@material-ui/icons/InvertColors'
import ToggleButton from '@material-ui/lab/ToggleButton'
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup'

const LayoutBase: React.ComponentType<React.PropsWithChildren<{
    activeTable: string | undefined
    tableAction: string | undefined
    setThemeId: (updater: (themeId: 'dark' | 'light') => 'dark' | 'light') => void
}>> = (
    {children, activeTable, tableAction, setThemeId}
) => {
    const history = useHistory()
    return <>
        <AppBar position="static">
            <Toolbar variant="dense">
                <IconButton
                    edge="start" color="inherit" aria-label="menu"
                    onClick={() => history.push('/')}
                >
                    <IcHome/>
                </IconButton>
                <Typography
                    variant="caption" color="inherit"
                    component={Link} to={'/'}
                    style={{textDecoration: 'none', display: 'flex', flexDirection: 'column', lineHeight: 1.125}}
                >
                    <span>DynamoDB Visualizer</span>
                    <span>by bemit</span>
                </Typography>

                {activeTable ? <Box ml={2}><ToggleButtonGroup
                    value={tableAction ? tableAction : 'config'}
                    exclusive
                    onChange={(e, val) =>
                        val ?
                            history.push('/table/' + activeTable + '/' + val) :
                            history.push('/table/' + activeTable + '/' + (tableAction || 'config'))
                    }
                >
                    <ToggleButton value="config" style={{color: 'inherit'}}>
                        Config
                    </ToggleButton>
                    <ToggleButton value="data" style={{color: 'inherit'}}>
                        Data
                    </ToggleButton>
                </ToggleButtonGroup></Box> : null}

                {activeTable ? <Box ml={2}><Typography variant={'body2'} style={{fontWeight: 'bold', letterSpacing: 0.56}}>
                    Table: <code>{activeTable}</code>
                </Typography></Box> : null}

                <IconButton
                    edge="start" color="inherit" aria-label="menu"
                    href={'https://github.com/elbakerino/dynamodb-visualizer'}
                    //onClick={() => history.push('https://github.com/elbakerino/dynamodb-visualizer')}
                    style={{marginLeft: 'auto'}}
                >
                    <IcGitHub/>
                </IconButton>
                <IconButton
                    edge="start" color="inherit" aria-label="menu"
                    onClick={() => setThemeId((id: 'dark' | 'light') => id === 'dark' ? 'light' : 'dark')}
                    style={{marginLeft: 3}}
                >
                    <IcTheme/>
                </IconButton>
            </Toolbar>
        </AppBar>
        {children}
    </>
}

export const Layout = memo(LayoutBase)
