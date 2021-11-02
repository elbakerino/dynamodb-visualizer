import React, { memo } from 'react'
import { DynamoTableDesigner } from './DynamoTableDesigner'
import { DynamoDataTable } from './DynamoDataTable'
import { Route, Switch } from 'react-router-dom'
import { DynamoTableInfo } from './DynamoTableInfo'
import { useDynamoTables } from '../feature/DynamoTables'
import { LinearProgress } from '@material-ui/core'
import { createStateContext } from '../lib/createStateContext'

export interface PageDynamoTableContextType {
    activeTable?: string
    tableAction?: string
    configSection?: string
}

export const {
    useSetState: useSetPageTable,
    useState: usePageTable,
    Provider: PageDynamoTableProvider,
} = createStateContext<PageDynamoTableContextType>()

const PageDynamoTableBase = (
    {
        match,
    }: {
        match: { params: { [k: string]: string } }
    }
) => {
    const {setState: setPageTable} = useSetPageTable()
    const [loading, setLoading] = React.useState<number>(0)
    const activeFetch = React.useRef<number>(0)
    const {loadDetails} = useDynamoTables()

    const matchTableId = match.params.tableId
    React.useEffect(() => {
        const fetchId = activeFetch.current = activeFetch.current + 1
        setLoading(1)
        loadDetails(matchTableId).then(res => {
            if(activeFetch.current !== fetchId) {
                return
            }
            if(res === 200) {
                setPageTable({activeTable: matchTableId})
                setLoading(2)
            } else if(res === 407 || res === 506) {
                setLoading(0)
            } else {
                setLoading(3)
            }
        })
        return () => setPageTable({})
    }, [setPageTable, matchTableId, loadDetails, setLoading, activeFetch])

    const matchTableAction = match.params.tableAction
    React.useEffect(() => {
        setPageTable(s => ({
            ...s,
            tableAction: matchTableAction,
        }))
        return () => setPageTable(s => ({
            ...s,
            tableAction: undefined,
        }))
    }, [setPageTable, matchTableAction])

    return <>
        <Switch>
            <Route
                path={[
                    `/table/${matchTableId}`,
                    `/table/${matchTableId}/designer/:configSection?`,
                ]}
                exact
                render={({match}) =>
                    <DynamoTableDesigner
                        match={match}
                        loading={loading}
                    />
                }
            />

            <Route path={`/table/${matchTableId}/info`}>
                <DynamoTableInfo/>
            </Route>

            <Route path={`/table/${matchTableId}/viz`}>
                <DynamoDataTable/>
            </Route>
        </Switch>
        {loading === 1 ? <LinearProgress style={{flexShrink: 0}}/> : null}
    </>
}
export const PageDynamoTable = memo(PageDynamoTableBase)
