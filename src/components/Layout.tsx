import React, { memo } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { AppBar, Box, IconButton, Paper, Toolbar, Typography } from '@material-ui/core'
import IcHome from '@material-ui/icons/Home'
import IcGitHub from '@material-ui/icons/GitHub'
import IcTheme from '@material-ui/icons/InvertColors'
import ToggleButton from '@material-ui/lab/ToggleButton'
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup'
import IcTune from '@material-ui/icons/Tune'
import IcInfo from '@material-ui/icons/Description'
import IcViz from '@material-ui/icons/TableChart'

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
        {activeTable ? <Box style={{flexShrink: 0}} p={1}>
            <Paper elevation={2}>
                <Box p={1} style={{display: 'flex', alignItems: 'center', overflow: 'auto', flexShrink: 0}}>
                    <ToggleButtonGroup
                        value={tableAction ? tableAction : 'config'}
                        exclusive
                        onChange={(e, val) =>
                            val ?
                                history.push('/table/' + activeTable + '/' + val) :
                                history.push('/table/' + activeTable + '/' + (tableAction || 'config'))
                        }
                    >
                        <ToggleButton value="config" style={{color: 'inherit'}}>
                            <IcTune/>
                            <span style={{paddingLeft: 8}}>Config</span>
                        </ToggleButton>
                        <ToggleButton value="info" style={{color: 'inherit'}}>
                            <IcInfo/>
                            <span style={{paddingLeft: 8}}>Info</span>
                        </ToggleButton>
                        <ToggleButton value="viz" style={{color: 'inherit'}}>
                            <IcViz/>
                            <span style={{paddingLeft: 8}}>Viz</span>
                        </ToggleButton>
                    </ToggleButtonGroup>

                    <Box ml={2}><Typography variant={'body2'} style={{marginLeft: 'auto', fontWeight: 'bold', letterSpacing: 0.56}}>
                        Table: <code>{activeTable}</code>
                    </Typography></Box>
                </Box>
            </Paper>
        </Box> : null}
    </>
}

export const Layout = memo(LayoutBase)
