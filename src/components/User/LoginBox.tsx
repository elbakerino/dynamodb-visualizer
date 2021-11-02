import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField } from '@material-ui/core'
import React from 'react'
import { useExplorerContext } from '../../feature/ExplorerContext'
import IcClose from '@material-ui/icons/Close'
import Typography from '@material-ui/core/Typography'
import IcCheck from '@material-ui/icons/Check'

export const LoginBox: React.ComponentType<{
    open: boolean
    onClose: () => void
    setShowOnboarding: React.Dispatch<React.SetStateAction<number>>
}> = (
    {
        open, onClose,
        setShowOnboarding,
    }
) => {
    const {login, createUser, id} = useExplorerContext()
    const emailInp = React.useRef<null | HTMLInputElement>(null)
    const [creating, setCreating] = React.useState<number>(0)
    const [loggingIn, setLoggingIn] = React.useState<number>(0)
    const [email, setEmail] = React.useState<string>('')
    const [password, setPassword] = React.useState<string>('')

    React.useEffect(() => {
        if(open) {
            setCreating(0)
            setLoggingIn(0)
        }
    }, [open, setCreating, setLoggingIn])

    // hack to have the correct ref after mount,
    // otherwise e.g. the validity lags behind "one browser change" before any user change
    const [, setMounted] = React.useState(false)
    React.useEffect(() => {
        const timer = window.setTimeout(() => setMounted(o => !o), 50)
        return () => window.clearTimeout(timer)
    }, [open, setMounted, emailInp])

    return <Dialog
        open={open} onClose={() => onClose()} fullWidth maxWidth={'xs'}
    >
        <DialogTitle>
            <span style={{display: 'flex'}}>
                Authentication
                <IconButton
                    size={'small'}
                    style={{margin: 'auto 0 auto auto'}}
                    onClick={() => onClose()}
                ><IcClose/></IconButton>
            </span>
        </DialogTitle>
        <form>
            <DialogContent style={{paddingTop: 0}}>
                <Box pb={2}>
                    <small style={{display: 'block'}}>Login or register for explorer:</small>
                    <small style={{display: 'block'}}>{id}</small>
                </Box>

                {creating === 1 || loggingIn === 1 ? <Box style={{textAlign: 'center'}} p={2}>
                    <CircularProgress/>
                </Box> : null}

                {creating === 2 ? <Typography variant={'body2'} align={'center'}><IcCheck fontSize={'inherit'}/> user created 👋</Typography> : null}
                {creating === 3 ? <Typography variant={'body2'} align={'center'}>Error creating user, please try again.</Typography> : null}

                {loggingIn === 2 ? <Typography variant={'body2'} align={'center'}><IcCheck fontSize={'inherit'}/> logged in!</Typography> : null}
                {loggingIn === 3 ? <Typography variant={'body2'} align={'center'}>Error logging in user, please try again.</Typography> : null}

                <Box
                    my={2}
                    style={{display: (creating === 0 && loggingIn === 0) || (creating === 3 || loggingIn === 3) ? undefined : 'none'}}
                >
                    <TextField
                        fullWidth type={'email'}
                        label={'E-Mail'}
                        inputRef={emailInp}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        error={email.length > 3 && !emailInp.current?.validity?.valid}
                        helperText={!emailInp.current?.validity?.valid ? 'Invalid email.' : ''}
                    />
                </Box>
                <Box
                    mb={2}
                    style={{display: (creating === 0 && loggingIn === 0) || (creating === 3 || loggingIn === 3) ? undefined : 'none'}}
                >
                    <TextField
                        fullWidth type={'password'}
                        label={'Password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        error={password.length > 1 && password.length < 8}
                        helperText={password.length > 1 && password.length < 8 ? 'Passwort needs min. 8 characters.' : ''}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => {
                        onClose()
                    }}
                    style={{marginRight: 'auto'}}
                >Not Now</Button>

                <Button
                    disabled={Boolean(!email || !password || !emailInp.current?.validity?.valid)}
                    onClick={() => {
                        setLoggingIn(0)
                        setCreating(1)
                        createUser(email, password).then(created => {
                            if(created) {
                                setCreating(2)
                                setLoggingIn(1)
                                login(email, password).then(res => {
                                    if(res) {
                                        setLoggingIn(2)
                                        setShowOnboarding(1)
                                        onClose()
                                        return
                                    }
                                    setLoggingIn(3)
                                })
                                return
                            }
                            setCreating(3)
                        })
                    }}
                >Register</Button>

                <Button
                    disabled={Boolean(
                        !email || !password || !emailInp.current?.validity?.valid ||
                        creating === 1 ||
                        loggingIn === 1 ||
                        loggingIn === 2
                    )}
                    onClick={() => {
                        setCreating(0)
                        setLoggingIn(1)
                        login(email, password).then(res => {
                            if(res) {
                                setLoggingIn(2)
                                onClose()
                                return
                            }
                            setLoggingIn(3)
                        })
                    }}
                >Login</Button>
            </DialogActions>
        </form>
    </Dialog>
}
