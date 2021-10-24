import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { DynamoTables } from './DynamoTables'
import { DynamoTablePage } from './DynamoTablePage'
import { DynamoExplorers } from './DynamoDataTable'
import { ExplorerEndpoints } from './ExplorerEndpoints'
import { useExplorerContext } from '../feature/ExplorerContext'
import { useDispatch } from 'react-redux'
import { ExplorerTableActionClear } from '../feature/DynamoTables'
import { UserProfile } from './User/UserProfile'

export const setLocalExplorers = (explorers: DynamoExplorers) => {
    window.localStorage.setItem('dyndb-viz--explorers', JSON.stringify(explorers))
}

export const getLocalExplorers = (): DynamoExplorers => {
    const entry = window.localStorage.getItem('dyndb-viz--explorers')
    let parsed: DynamoExplorers = []
    if(entry) {
        try {
            parsed = JSON.parse(entry)
        } catch(e) {
            console.log('error json data for dyndb-viz--explorers', e)
        }
    }
    return parsed
}

export const Visualizer = (
    {
        setActiveTable,
        setTableAction,
        explorers, setExplorers,
    }:
        {
            setActiveTable: (table: string | undefined) => void
            setTableAction: (table: string | undefined) => void
            explorers: DynamoExplorers
            setExplorers: React.Dispatch<React.SetStateAction<DynamoExplorers>>
        }
) => {
    const {setActive, id} = useExplorerContext()
    const dispatch = useDispatch()
    const mounted = React.useRef(false)

    React.useEffect(() => {
        if(mounted.current) {
            dispatch({
                type: 'explorer_tables.clear',
            } as ExplorerTableActionClear)
        }
        mounted.current = true
    }, [id, dispatch])

    return <Switch>
        <Route path="/" exact>
            <ExplorerEndpoints
                explorers={explorers}
                setExplorers={setExplorers}
                activeExplorer={id}
                setActiveExplorer={setActive}
            />
        </Route>
        <Route path="/tables" exact>
            <DynamoTables/>
        </Route>
        <Route path="/user" exact>
            <UserProfile/>
        </Route>
        <Route path="/table/:tableId/:tableAction?"
               render={({match}) =>
                   <DynamoTablePage
                       setActiveTable={setActiveTable}
                       setTableAction={setTableAction}
                       match={match}
                   />
               }
        />
    </Switch>
}
