import { DynamoDbIndex, ParsedDataResult } from './DynamoTableData'

export const parseExampleData = (
    index: [DynamoDbIndex] | [DynamoDbIndex, DynamoDbIndex],
    tableItems: any[]
) => {
    const sorted: ParsedDataResult['sorted'] = {}
    const allKeys: string[] = []

    const partition = index[0]
    const sort = index[1]
    tableItems.forEach((item: any) => {
        if(!partition) return
        const partitionKeyValObj = item[partition.AttributeName]
        if(!partitionKeyValObj) return
        let sortValObj
        if(sort) {
            sortValObj = item[sort.AttributeName]
            if(!sortValObj) return
        }

        const partitionKey = Object.values(partitionKeyValObj)[0] as string

        if(!sorted[partitionKey]) {
            sorted[partitionKey] = []
        }
        sorted[partitionKey].push(item)
        Object.keys(item)
            .filter(k => k !== partition.AttributeName && (!sort || k !== sort.AttributeName))
            .forEach((ik) => allKeys.includes(ik) ? null : allKeys.push(ik))
    })

    if(sort) {
        Object.keys(sorted).forEach(k => {
            sorted[k] = sorted[k].sort((a, b) => {
                const sortValA = Object.values(a[sort.AttributeName])[0] as string
                const sortValB = Object.values(b[sort.AttributeName])[0] as string

                return sortValA.localeCompare(sortValB)
            })
        })
    }

    return {sorted, allKeys}
}
