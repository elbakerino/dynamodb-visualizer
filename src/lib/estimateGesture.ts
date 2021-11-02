import { SimpleGesturesResult } from './SimpleGestures'

export const estimateGesture = (
    now: number,
    lastStartTime: number,
    startX: number,
    startY: number,
    lastX: number,
    lastY: number,
    minMovementX: number,
    minMovementY: number,
): SimpleGesturesResult => {
    const movedX = lastX - startX
    const movedY = lastY - startY
    let nameDirX: SimpleGesturesResult['dirX']
    if(movedX > minMovementX) {
        nameDirX = 'right'
    } else if(movedX < (minMovementX * -1)) {
        nameDirX = 'left'
    } else {
        nameDirX = 'same'
    }
    let nameDirY: SimpleGesturesResult['dirY']
    if(movedY > minMovementY) {
        nameDirY = 'down'
    } else if(movedY < (minMovementY * -1)) {
        nameDirY = 'up'
    } else {
        nameDirY = 'same'
    }

    let nameDir: SimpleGesturesResult['dir']
    if(nameDirX === 'same') {
        if(nameDirY === 'same') {
            nameDir = 'point'
        } else if(nameDirY === 'up') {
            nameDir = 'up'
        } else if(nameDirY === 'down') {
            nameDir = 'down'
        }
    } else if(nameDirY === 'same') {
        if(nameDirX === 'right') {
            nameDir = 'right'
        } else if(nameDirX === 'left') {
            nameDir = 'left'
        }
    } else if(nameDirY === 'up') {
        if(nameDirX === 'right') {
            nameDir = 'left-bottom-right-top'
        } else if(nameDirX === 'left') {
            nameDir = 'right-bottom-left-top'
        }
    } else if(nameDirY === 'down') {
        if(nameDirX === 'right') {
            nameDir = 'left-top-right-bottom'
        } else if(nameDirX === 'left') {
            nameDir = 'right-top-left-bottom'
        }
    }
    const duration = now - lastStartTime
    const posMovedX = movedX < 0 ? movedX * -1 : movedX
    const posMovedY = movedY < 0 ? movedY * -1 : movedY
    // milli px per milli second
    const mPxPerMsX = Number((posMovedX * 1000 / duration).toFixed(0))
    const mPxPerMsY = Number((posMovedY * 1000 / duration).toFixed(0))

    return {
        duration: duration,
        dirY: nameDirY,
        dirX: nameDirX,
        startX: startX,
        startY: startY,
        // @ts-ignore
        dir: nameDir,
        posMovedX: posMovedX,
        posMovedY: posMovedY,
        mPxPerMsX: mPxPerMsX,
        mPxPerMsY: mPxPerMsY,
    }
}
