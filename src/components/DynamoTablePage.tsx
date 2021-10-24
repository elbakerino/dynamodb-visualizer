import React, { memo } from 'react'
import { DynamoTableMeta } from './DynamoTableMeta'
import { DynamoDataTable } from './DynamoDataTable'
import { Route, Switch } from 'react-router-dom'
import { DynamoTableInfo } from './DynamoTableInfo'
import { useDynamoTables } from '../feature/DynamoTables'

const DynamoTablePageBase = (
    {
        match,
        setActiveTable,
        setTableAction,
    }: {
        setActiveTable: (table: string | undefined) => void
        setTableAction: (table: string | undefined) => void
        match: { params: { [k: string]: string } }
    }
) => {
    const {loadDetails} = useDynamoTables()

    const matchTableId = match.params.tableId
    React.useEffect(() => {
        loadDetails(matchTableId).then(res => {
            if(res) setActiveTable(matchTableId)
        })
        return () => setActiveTable(undefined)
    }, [setActiveTable, matchTableId, loadDetails])

    const matchTableAction = match.params.tableAction
    React.useEffect(() => {
        setTableAction(matchTableAction)
        return () => setTableAction(undefined)
    }, [setTableAction, matchTableAction])

    return <>
        <Switch>
            <Route
                path={[
                    `/table/${matchTableId}`,
                    `/table/${matchTableId}/config`,
                ]}
                exact
            >
                <DynamoTableMeta activeTable={matchTableId}/>
            </Route>

            <Route path={`/table/${matchTableId}/info`}>
                <DynamoTableInfo activeTable={matchTableId}/>
            </Route>

            <Route path={`/table/${matchTableId}/viz`}>
                <DynamoDataTable activeTable={matchTableId}/>
            </Route>
        </Switch>
    </>
}
export const DynamoTablePage = memo(DynamoTablePageBase)
