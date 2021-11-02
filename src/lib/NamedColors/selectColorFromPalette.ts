import { Palette } from '@material-ui/core/styles/createPalette'
import { NamedColorsProviderProps } from './NamedColorsProvider'
import { isHex, isRgb, isRgba } from './rgbToHex'

export const selectColorFromPalette = (palette: Palette, shadedColors: NamedColorsProviderProps['shadedColors'], colorOrName: string, defaultColor?: string): string | undefined => {
    if(!colorOrName) return colorOrName

    if(isHex(colorOrName) || isRgb(colorOrName) || isRgba(colorOrName)) {
        return colorOrName
    }

    const supportedShadedColors = Object.keys(shadedColors) as (keyof typeof shadedColors)[]

    if(colorOrName.indexOf('_') === 0) {
        // expects to be a "generic-palette color" / `supportedShadedColors`
        const colorNamePath = colorOrName.split('__')
        if(!colorNamePath || !colorNamePath[0] || !colorNamePath[1]) {
            console.log('invalid named color detected, will use ' + defaultColor + ' instead', colorOrName)
            return defaultColor
        }
        const colorKey = colorNamePath[0].substr(1) as keyof typeof shadedColors
        const shadeKey = colorNamePath[1] as keyof typeof shadedColors[keyof typeof shadedColors]
        if(supportedShadedColors.indexOf(colorKey) === -1) {
            console.log('not supported shaded color detected, will use ' + defaultColor + ' instead', colorOrName)
            return defaultColor
        }
        return shadedColors[colorKey][shadeKey]
    } else if(colorOrName.indexOf('__') !== -1) {
        // expects to be a "mui palette color"
        const colorNamePath = colorOrName.split('__')
        if(!colorNamePath || !colorNamePath[0] || !colorNamePath[1]) {
            console.log('invalid named color detected, will use ' + defaultColor + ' instead', colorOrName)
            return defaultColor
        }
        const primaryKey = colorNamePath[0] as keyof typeof palette
        const shadeKey = colorNamePath[1] as keyof typeof palette[keyof typeof palette]
        if(!palette[primaryKey] || !palette[primaryKey][shadeKey]) {
            console.log('not existing named color detected, will use ' + defaultColor + ' instead', colorOrName)
            return defaultColor
        }
        return palette[primaryKey][shadeKey]
    }
    return colorOrName
}
