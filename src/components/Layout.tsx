import React, { memo } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { AppBar, Box, IconButton, Paper, Toolbar, Typography } from '@material-ui/core'
import IcHome from '@material-ui/icons/Home'
import IcGitHub from '@material-ui/icons/GitHub'
import IcTheme from '@material-ui/icons/InvertColors'
import ToggleButton from '@material-ui/lab/ToggleButton'
import Button from '@material-ui/core/Button'
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup'
import IcTables from '@material-ui/icons/ViewList'
import IcTune from '@material-ui/icons/Tune'
import IcInfo from '@material-ui/icons/Description'
import IcLogin from '@material-ui/icons/AccountBox'
import IcLogout from '@material-ui/icons/PowerOff'
import IcViz from '@material-ui/icons/TableChart'
import { useExplorerContext } from '../feature/ExplorerContext'
import { useDynamoTables } from '../feature/DynamoTables'
import { DynamoExplorers } from './DynamoDataTable'

const LayoutBase: React.ComponentType<React.PropsWithChildren<{
    activeTable: string | undefined
    tableAction: string | undefined
    setThemeId: (updater: (themeId: 'dark' | 'light') => 'dark' | 'light') => void
    setOpenLogin: React.Dispatch<React.SetStateAction<boolean>>
    explorers: DynamoExplorers
}>> = (
    {
        children, activeTable,
        tableAction, setThemeId,
        setOpenLogin, explorers,
    }
) => {
    const history = useHistory()
    const {tableDetails} = useDynamoTables()
    const {id, connection, logout} = useExplorerContext()
    const explorer = explorers.find(e => e.endpoint === id)
    const tableMeta = activeTable ? tableDetails?.get(activeTable)?.meta : undefined

    return <>
        <AppBar position="static">
            <Toolbar variant="dense">
                <IconButton
                    edge="start" color="inherit" aria-label="menu"
                    onClick={() => history.push({
                        pathname: '/',
                        search: id ? '?explorer=' + encodeURIComponent(id) : '',
                    })}
                >
                    <IcHome/>
                </IconButton>

                <Typography
                    variant="caption" color="inherit"
                    component={Link} to={'/' + (id ? '?explorer=' + encodeURIComponent(id) : '')}
                    style={{textDecoration: 'none', display: 'flex', flexDirection: 'column', lineHeight: 1.125}}
                >
                    <span>DynamoDB Visualizer</span>
                    <span>by bemit</span>
                </Typography>

                {id ? <Box ml={2}>
                    <Typography
                        variant="caption" color="inherit"
                        component={'a'} href={id} target={'_blank'} rel={'noopener noreferrer'}
                        style={{textDecoration: 'none', display: 'flex', flexDirection: 'column', lineHeight: 1.125}}
                    >Explorer:</Typography>
                    <Typography
                        variant="caption" color="inherit"
                        component={'a'} href={id} target={'_blank'} rel={'noopener noreferrer'}
                        style={{textDecoration: 'none', display: 'flex', flexDirection: 'column', lineHeight: 1.125}}
                    >{explorer?.name || id}</Typography>
                </Box> : null}

                {id && connection?.auth ? <IconButton
                    color="inherit" aria-label="menu"
                    onClick={() => logout(id)}
                >
                    <IcLogout/>
                </IconButton> : null}

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

        <Box style={{flexShrink: 0}} p={1}>
            <Paper elevation={2}>
                <Box p={1} style={{display: 'flex', alignItems: 'center', overflow: 'auto', flexShrink: 0}}>
                    {id && !connection.auth ? <Button
                        startIcon={<IcLogin/>}
                        onClick={() => setOpenLogin(true)}
                        variant={'contained'} color={'primary'}
                    >Authentication required</Button> : null}

                    {id && !connection.auth ? null : <ToggleButtonGroup
                        value={tableAction ? tableAction : 'config'}
                        exclusive
                        onChange={(e, val) =>
                            val === 'tables' ?
                                history.push({
                                    pathname: '/tables',
                                    search: id ? '?explorer=' + encodeURIComponent(id) : '',
                                }) :
                                val ?
                                    history.push({
                                        pathname: '/table/' + activeTable + '/' + val,
                                        search: id ? '?explorer=' + encodeURIComponent(id) : '',
                                    }) :
                                    history.push({
                                        pathname: '/table/' + activeTable + '/' + (tableAction || 'config'),
                                        search: id ? '?explorer=' + encodeURIComponent(id) : '',
                                    })
                        }
                    >
                        <ToggleButton value="tables" style={{color: 'inherit'}}>
                            <IcTables/>
                            <span style={{paddingLeft: 8}}>Tables</span>
                        </ToggleButton>
                        {activeTable ? <ToggleButton value="config" style={{color: 'inherit'}}>
                            <IcTune/>
                            <span style={{paddingLeft: 8}}>Config</span>
                        </ToggleButton> : null}
                        {activeTable ? <ToggleButton value="info" style={{color: 'inherit'}}>
                            <IcInfo/>
                            <span style={{paddingLeft: 8}}>Info</span>
                        </ToggleButton> : null}
                        {activeTable ? <ToggleButton value="viz" style={{color: 'inherit'}}>
                            <IcViz/>
                            <span style={{paddingLeft: 8}}>Viz</span>
                        </ToggleButton> : null}
                    </ToggleButtonGroup>}

                    {activeTable ? <Box ml={2}><Typography variant={'body2'} style={{marginLeft: 'auto', fontWeight: 'bold', letterSpacing: 0.56}}>
                        Table: <code>{tableMeta?.name || activeTable}</code>
                    </Typography></Box> : null}

                    {!id  ? <Box ml={2}><Typography variant={'body2'} style={{marginLeft: 'auto', fontWeight: 'bold', letterSpacing: 0.56}}>
                        Mode: Browser Storage
                    </Typography></Box> : null}
                    {id && connection.auth ? <IconButton
                        color="inherit" aria-label="user"
                        onClick={() =>
                            history.push({
                                pathname: '/user',
                                search: id ? '?explorer=' + encodeURIComponent(id) : '',
                            })
                        }
                        style={{marginLeft: 'auto'}}
                    >
                        <IcLogin/>
                    </IconButton> : null}
                </Box>
            </Paper>
        </Box>
    </>
}

export const Layout = memo(LayoutBase)
