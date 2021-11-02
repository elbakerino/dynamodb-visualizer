import React, { memo } from 'react'
import { EdgeProps } from 'react-flow-renderer'
import IcGear from '@material-ui/icons/Memory'
import Button from '@material-ui/core/Button'
import { Dialog, DialogContent, DialogContentText } from '@material-ui/core'
import { EdgeInteractiveBase } from '../../FlowEdges/EdgeInteractive'

const showDot = true

const EdgeEntityConnectionBase: React.ComponentType<EdgeProps> = (props) => {
    const [highlight, setHighlight] = React.useState(false)
    const [isOnButton, setIsOnButton] = React.useState(false)
    const [showOptions, setShowOptions] = React.useState(false)
    return <>
        <EdgeInteractiveBase
            foreignObjectSize={showOptions || isOnButton || highlight ? 40 : 0}
            showDot={showDot}
            onHighlight={setHighlight}
            {...props}
        >
            <>
                {showOptions || isOnButton || highlight ? <Button
                    variant={'text'}
                    className="edgebutton"
                    style={{
                        minWidth: 30,
                        zIndex: 3,
                        borderRadius: 6,
                    }}
                    onMouseEnter={() => setIsOnButton(true)}
                    onMouseLeave={() => setIsOnButton(false)}
                    onClick={() => setShowOptions(true)}
                    //onClick={(event) => onEdgeClick(event, id)}
                >
                    <IcGear/>
                </Button> : null}
            </>
        </EdgeInteractiveBase>
        <Dialog open={showOptions} onClose={() => setShowOptions(false)}>
            <DialogContent>
                <DialogContentText>
                    Dialog
                    <small style={{display: 'flex'}}><strong>🚧 Work in progress</strong></small>
                </DialogContentText>
            </DialogContent>
        </Dialog>
    </>
}

export const EdgeEntityConnection = memo(EdgeEntityConnectionBase)
