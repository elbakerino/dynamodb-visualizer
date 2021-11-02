import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { DynamoTables } from './DynamoTables'
import { PageDynamoTable } from './PageDynamoTable'
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
        explorers, setExplorers,
        setShowOnboarding,
    }:
        {
            explorers: DynamoExplorers
            setExplorers: React.Dispatch<React.SetStateAction<DynamoExplorers>>
            setShowOnboarding: React.Dispatch<React.SetStateAction<number>>
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
                setShowOnboarding={setShowOnboarding}
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
                   <PageDynamoTable match={match}/>
               }
        />
    </Switch>
}
