import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import MuiList from '@material-ui/core/List'
import React from 'react'
import { NodeSelectorContentProps } from '../../FlowNodes/NodeSelectorContent'
import { NodeCardLabelFlowStateDataScopes } from '../../FlowNodes/NodeCardLabel'
import { useFlowActions } from '../../FlowState/FlowContext'
import { Box, ListSubheader } from '@material-ui/core'
import IcBasic from '@material-ui/icons/Article'
import IcMedia from '@material-ui/icons/Image'
import IcDatabase from '@material-ui/icons/AccountTree'
import IcChart from '@material-ui/icons/PieChart'
import IcFolder from '@material-ui/icons/CreateNewFolder'
import IcFlow from '@material-ui/icons/Mediation'
import IcWorkshop from '@material-ui/icons/School'
import IcWireframe from '@material-ui/icons/GridView'
import IcNetwork from '@material-ui/icons/Router'
import IcStore from '@material-ui/icons/Store'
import IcFormulas from '@material-ui/icons/Functions'
import IcWatch from '@material-ui/icons/Watch'
import IcBusiness from '@material-ui/icons/Business'
import IcChat from '@material-ui/icons/ChatBubble'
import IcSchedule from '@material-ui/icons/Alarm'
import { NodeSelectorBase, NodeSelectorProps } from '../../FlowNodes/NodeSelector'

const showAll = false
const CustomNodeSelectorContent: React.ComponentType<NodeSelectorContentProps> = (
    {
        type,
        id,
    }
) => {
    const {switchType} = useFlowActions<NodeCardLabelFlowStateDataScopes>()
    return <Box style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', maxWidth: 365}}>
        <MuiList dense style={{minWidth: 100}}>
            <ListSubheader style={{lineHeight: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center'}}>
                <IcBasic style={{fontSize: '1.25em', marginRight: 3}}/>
                Basic
            </ListSubheader>
            <ListItem
                onClick={() => {
                    switchType(type, id, 'card_label')
                }}
                button selected
            >
                <ListItemText primary={'Label'}/>
            </ListItem>
            <ListItem
                onClick={() => {
                    switchType(type, id, 'card_note')
                }}
                button
            >
                <ListItemText primary={'Note'}/>
            </ListItem>
            {showAll ? <ListItem
                onClick={() => {
                    switchType(type, id, 'document')
                }}
                button
            >
                <ListItemText primary={'Document'}/>
            </ListItem> : null}
            {showAll ? <ListItem
                onClick={() => {
                    switchType(type, id, 'table')
                }}
                button
            >
                <ListItemText primary={'Table'}/>
            </ListItem> : null}
        </MuiList>
        {showAll ? <MuiList dense style={{minWidth: 100}}>
            <ListSubheader style={{lineHeight: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center'}}>
                <IcMedia style={{fontSize: '1.25em', marginRight: 3}}/>
                Media
            </ListSubheader>
            <ListItem
                onClick={() => {
                    switchType(type, id, 'image')
                }}
                button
            >
                <ListItemText primary={'Image'}/>
            </ListItem>
            <ListItem
                onClick={() => {
                    switchType(type, id, 'video')
                }}
                button
            >
                <ListItemText primary={'Video'}/>
            </ListItem>
            <ListItem
                onClick={() => {
                    switchType(type, id, 'sound')
                }}
                button
            >
                <ListItemText primary={'Sound'}/>
            </ListItem>
        </MuiList> : null}
        <MuiList dense style={{minWidth: 100}}>
            <ListSubheader style={{lineHeight: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center'}}>
                <IcDatabase style={{fontSize: '1.25em', marginRight: 3}}/>
                Database
            </ListSubheader>
            <ListItem
                onClick={() => {
                    switchType(type, id, 'entity')
                }}
                button
            >
                <ListItemText primary={'Entity'}/>
            </ListItem>
            {showAll ? <ListItem
                onClick={() => {
                    switchType(type, id, 'database')
                }}
                button
            >
                <ListItemText primary={'database'}/>
            </ListItem> : null}
        </MuiList>
        {showAll ? <>
            <MuiList dense style={{minWidth: 100}}>
                <ListSubheader style={{lineHeight: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center'}}>
                    <IcChart style={{fontSize: '1.25em', marginRight: 3}}/>
                    Chart
                </ListSubheader>
                <ListItem
                    onClick={() => {
                        switchType(type, id, 'chart_pie')
                    }}
                    button
                >
                    <ListItemText primary={'Pie Chart'}/>
                </ListItem>
                <ListItem
                    onClick={() => {
                        switchType(type, id, 'chart_bar')
                    }}
                    button
                >
                    <ListItemText primary={'Bar Chart'}/>
                </ListItem>
                <ListItem
                    onClick={() => {
                        switchType(type, id, 'chart_line')
                    }}
                    button
                >
                    <ListItemText primary={'Line Chart'}/>
                </ListItem>
                <ListItem
                    onClick={() => {
                        switchType(type, id, 'chart_scatter_plot')
                    }}
                    button
                >
                    <ListItemText primary={'Scatter Plot'}/>
                </ListItem>
                <ListItem
                    onClick={() => {
                        switchType(type, id, 'chart_bubble')
                    }}
                    button
                >
                    <ListItemText primary={'Bubble Chart'}/>
                </ListItem>
                <ListItem
                    onClick={() => {
                        switchType(type, id, 'chart_score')
                    }}
                    button
                >
                    <ListItemText primary={'Score List'}/>
                </ListItem>
            </MuiList>
            <MuiList dense style={{minWidth: 100}}>
                <ListSubheader style={{lineHeight: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center'}}>
                    <IcFlow style={{fontSize: '1.25em', marginRight: 3}}/>
                    Flow
                </ListSubheader>
                <ListItem
                    onClick={() => {
                        switchType(type, id, 'flow_start')
                    }}
                    button
                >
                    <ListItemText primary={'Start'}/>
                </ListItem>
                <ListItem
                    onClick={() => {
                        switchType(type, id, 'flow_decision')
                    }}
                    button
                >
                    <ListItemText primary={'Decision'}/>
                </ListItem>
                <ListItem
                    onClick={() => {
                        switchType(type, id, 'flow_step')
                    }}
                    button
                >
                    <ListItemText primary={'Step'}/>
                </ListItem>
            </MuiList>
            <MuiList dense style={{minWidth: 100}}>
                <ListSubheader style={{lineHeight: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center'}}>
                    <IcFolder style={{fontSize: '1.25em', marginRight: 3}}/>
                    Folder
                </ListSubheader>
            </MuiList>
            <MuiList dense style={{minWidth: 100}}>
                <ListSubheader style={{lineHeight: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center'}}>
                    <IcWorkshop style={{fontSize: '1.25em', marginRight: 3}}/>
                    Workshop
                </ListSubheader>
                <ListItem
                    onClick={() => {
                        switchType(type, id, 'symbol_dot')
                    }}
                    button
                >
                    <ListItemText primary={'Dot w/ Symbol'}/>
                </ListItem>
                <ListItem
                    onClick={() => {
                        switchType(type, id, 'vote')
                    }}
                    button
                >
                    <ListItemText primary={'vote'}/>
                </ListItem>
            </MuiList>
            <MuiList dense style={{minWidth: 100}}>
                <ListSubheader style={{lineHeight: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center'}}>
                    <IcWireframe style={{fontSize: '1.25em', marginRight: 3}}/>
                    Wireframe
                </ListSubheader>
            </MuiList>
            <MuiList dense style={{minWidth: 100}}>
                <ListSubheader style={{lineHeight: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center'}}>
                    <IcWatch style={{fontSize: '1.25em', marginRight: 3}}/>
                    Timeline
                </ListSubheader>
            </MuiList>
            <MuiList dense style={{minWidth: 100}}>
                <ListSubheader style={{lineHeight: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center'}}>
                    <IcNetwork style={{fontSize: '1.25em', marginRight: 3}}/>
                    Network
                </ListSubheader>
            </MuiList>
            <MuiList dense style={{minWidth: 100}}>
                <ListSubheader style={{lineHeight: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center'}}>
                    <IcStore style={{fontSize: '1.25em', marginRight: 3}}/>
                    Store
                </ListSubheader>
            </MuiList>
            <MuiList dense style={{minWidth: 100}}>
                <ListSubheader style={{lineHeight: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center'}}>
                    <IcFormulas style={{fontSize: '1.25em', marginRight: 3}}/>
                    Formulas
                </ListSubheader>
            </MuiList>
            <MuiList dense style={{minWidth: 100}}>
                <ListSubheader style={{lineHeight: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center'}}>
                    <IcChat style={{fontSize: '1.25em', marginRight: 3}}/>
                    Chat Bot
                </ListSubheader>
            </MuiList>
            <MuiList dense style={{minWidth: 100}}>
                <ListSubheader style={{lineHeight: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center'}}>
                    <IcBusiness style={{fontSize: '1.25em', marginRight: 3}}/>
                    Company
                </ListSubheader>
            </MuiList>
            <MuiList dense style={{minWidth: 100}}>
                <ListSubheader style={{lineHeight: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center'}}>
                    <IcSchedule style={{fontSize: '1.25em', marginRight: 3}}/>
                    Schedule
                </ListSubheader>
            </MuiList>
        </> : null}
    </Box>
}

export const CustomNodeSelector: React.ComponentType<NodeSelectorProps> = (props) => {
    return <NodeSelectorBase {...props} NodeSelectorContent={CustomNodeSelectorContent}/>
}
