import { NamedColorMapEntry, NamedColorsCachedMap, selectColor } from './NamedColorsProvider'
import { rgbToHex } from './rgbToHex'

export const makeCachedMap = (selectColor: selectColor, id: string, colorList: Partial<NamedColorMapEntry>[]): NamedColorsCachedMap => {
    const map: NamedColorsCachedMap = {
        id: id,
        entries: [],
        colorMap: {},
        nameMap: {},
        colors: [],
    }

    colorList?.forEach(color => {
        const fullColor: NamedColorMapEntry = {...color} as NamedColorMapEntry
        if(color.name) {
            const c = selectColor(color.name)
            if(c) {
                fullColor.color = rgbToHex(c)
            }
        } else if(color.color) {
            fullColor.name = color.color
        }
        if(fullColor.name && fullColor.color) {
            map.entries.push(fullColor)
            const i = map.entries.length - 1
            map.nameMap[fullColor.name] = i
            map.colors.push(fullColor.color)
            map.colorMap[fullColor.color] = i
        }
    })
    return map
}
