export function isHex(rgb: string) {
    return rgb.indexOf('#') === 0
}

export function isRgb(rgb: string) {
    return rgb.indexOf('rgb(') === 0
}

export function isRgba(rgba: string) {
    return rgba.indexOf('rgba(') === 0
}

export function rgbToHex(rgb: string) {
    // todo: add rgba support
    if(
        isHex(rgb) ||
        !isRgb(rgb)
    ) return rgb
    let sep = rgb.indexOf(',') > -1 ? ',' : ' '
    // @ts-ignore
    rgb = rgb.substr(4).split(')')[0].split(sep)

    let r = (+rgb[0]).toString(16),
        g = (+rgb[1]).toString(16),
        b = (+rgb[2]).toString(16)

    if(r.length === 1)
        r = '0' + r
    if(g.length === 1)
        g = '0' + g
    if(b.length === 1)
        b = '0' + b

    return '#' + r + g + b
}

// @ts-ignore
window.rgbToHex = rgbToHex
