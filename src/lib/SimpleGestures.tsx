import React, { TouchEventHandler } from 'react'
import { estimateGesture } from './estimateGesture'

export interface SimpleGesturesDirections {
    directionDiagonal: 'left-bottom-right-top' | 'right-bottom-left-top' | 'left-top-right-bottom' | 'right-top-left-bottom'
    directionX: 'right' | 'left' | 'same'
    directionY: 'up' | 'down' | 'same'
}

// @ts-ignore
const SimpleGesturesContext = React.createContext<SimpleGesturesActions>()

export interface SimpleGesturesEventHandler {
    onTouchStart: TouchEventHandler<any>
    onTouchMove: TouchEventHandler<any>
    onTouchEnd: TouchEventHandler<any>
}

export interface SimpleGesturesActions {
    handler: SimpleGesturesEventHandler
    addListener: addSimpleGesturesListener
}

export interface SimpleGesturesResult {
    duration: number
    dirY: SimpleGesturesDirections['directionY']
    dirX: SimpleGesturesDirections['directionX']
    dir: SimpleGesturesDirections['directionDiagonal'] | SimpleGesturesDirections['directionX'] | SimpleGesturesDirections['directionY'] | 'point'
    posMovedX: number
    posMovedY: number
    startX: number
    startY: number
    // milli px per milli second velocity for X-axis
    mPxPerMsX: number
    // milli px per milli second velocity for Y-axis
    mPxPerMsY: number
}

export interface SimpleGesturesResultStart {
    taps: number
    startX: number
    startY: number
    startTime: number
    lastStartTime: number
}

export interface SimpleGesturesListenerType {
    start: simpleGesturesListenerStart
    move: simpleGesturesListener
    end: simpleGesturesListener
}

export type simpleGesturesListenerUnsub = () => void
export type simpleGesturesListener = (gesture: SimpleGesturesResult) => void
export type simpleGesturesListenerStart = (start: SimpleGesturesResultStart) => void
export type addSimpleGesturesListener = <A extends keyof SimpleGesturesListenerType = keyof SimpleGesturesListenerType>(on: A, listener: SimpleGesturesListenerType[A]) => simpleGesturesListenerUnsub

export interface SimpleGesturesOptions {
    // grid in which to count taps as the same than previous
    touchGrid: number
    // in `ms` how long taps after another in the same grid are counted as the same
    touchAsSameTap: number
    // min. movement for X in px before counting it as "happening"
    minMovementX: number
    // min. movement for Y in px before counting it as "happening"
    minMovementY: number
}

export const SimpleGesturesProvider: React.ComponentType<React.PropsWithChildren<Partial<SimpleGesturesOptions>>> = (
    {
        children,
        touchGrid = 20,
        touchAsSameTap = 260,
        minMovementY = 10,
        minMovementX = 10,
    }
) => {
    const gestureRef = React.useRef({
        startX: -1,
        lastX: -1,
        lastStartGridX: -1,
        startY: -1,
        lastY: -1,
        lastStartGridY: -1,
        lastStartTime: 0,
        lastTime: 0,
        lastEndTime: 0,
        countTaps: 0,
        listeners: {
            start: [],
            move: [],
            end: [],
        } as {
            start: [number, simpleGesturesListenerStart][]
            move: [number, simpleGesturesListener][]
            end: [number, simpleGesturesListener][]
        },
        listenerId: 0,
    })
    const onTouchStart: SimpleGesturesEventHandler['onTouchStart'] = React.useCallback(e => {
        const touch = e.touches[0]
        const x = touch?.clientX
        const y = touch?.clientY
        // todo: the `touch grid` to check the same area of to count taps,
        //       should be normalized by the first touch point, not the page,
        //       resulting in a more correct "same spot" detection
        const gridX = Number((x / touchGrid).toFixed(0))
        const gridY = Number((y / touchGrid).toFixed(0))
        const {lastStartTime, lastStartGridX, lastStartGridY} = gestureRef.current
        const now = Date.now()
        let taps: number
        if(
            (now - lastStartTime) < touchAsSameTap &&
            gridX === lastStartGridX && gridY === lastStartGridY
        ) {
            taps = gestureRef.current.countTaps = gestureRef.current.countTaps + 1
        } else {
            taps = gestureRef.current.countTaps = 1
        }
        gestureRef.current.lastStartTime = now
        gestureRef.current.lastStartGridX = gridX
        gestureRef.current.lastStartGridY = gridY
        gestureRef.current.startX = x
        gestureRef.current.startY = y
        gestureRef.current.lastX = x
        gestureRef.current.lastY = y
        const listeners = [...gestureRef.current.listeners.start]
        listeners.forEach(([, listener]) => listener({
            taps: taps,
            startX: x,
            startY: y,
            startTime: now,
            lastStartTime: lastStartTime,
        }))
    }, [gestureRef, touchGrid, touchAsSameTap])

    const onTouchMove: SimpleGesturesEventHandler['onTouchMove'] = React.useCallback(e => {
        const touch = e.touches[0]
        const x = touch?.clientX
        const y = touch?.clientY
        const now = Date.now()
        gestureRef.current.lastX = x
        gestureRef.current.lastY = y
        gestureRef.current.lastTime = now
        if(gestureRef.current.listeners.move.length > 0) {
            const listeners = [...gestureRef.current.listeners.move]
            const {lastStartTime, lastX, lastY, startX, startY} = gestureRef.current
            const moveResult = estimateGesture(now, lastStartTime, startX, startY, lastX, lastY, minMovementX, minMovementY)
            listeners.forEach(([, listener]) => listener(moveResult))
        }
    }, [gestureRef, minMovementX, minMovementY])

    const onTouchEnd: SimpleGesturesEventHandler['onTouchEnd'] = React.useCallback(e => {
        const now = Date.now()
        if(gestureRef.current.listeners.end.length > 0) {
            const {lastStartTime, lastX, lastY, startX, startY} = gestureRef.current
            const listeners = [...gestureRef.current.listeners.end]
            const result = estimateGesture(now, lastStartTime, startX, startY, lastX, lastY, minMovementX, minMovementY)
            listeners.forEach(([, listener]) => listener(result))
        }

        gestureRef.current.lastEndTime = now
    }, [gestureRef, minMovementY, minMovementX])

    const addListener: SimpleGesturesActions['addListener'] = React.useCallback((on, listener) => {
        const nextId = gestureRef.current.listenerId = gestureRef.current.listenerId + 1
        // @ts-ignore
        gestureRef.current.listeners[on].push([nextId, listener])
        return () => {
            const i = gestureRef.current.listeners[on].findIndex(i => i[0] === nextId)
            if(i !== -1) {
                gestureRef.current.listeners[on].splice(i, 1)
            }
            console.log('unsub', on, nextId, i, gestureRef.current.listeners[on])
        }
    }, [gestureRef])

    const actions: SimpleGesturesActions = React.useMemo(() => ({
        handler: {
            onTouchStart, onTouchMove, onTouchEnd,
        },
        addListener,
    }), [
        onTouchStart, onTouchMove, onTouchEnd,
        addListener,
    ])

    return <SimpleGesturesContext.Provider value={actions}>
        {children}
    </SimpleGesturesContext.Provider>
}

export const useSimpleGestures = (): SimpleGesturesActions => React.useContext(SimpleGesturesContext)
