import createMuiTheme from '@material-ui/core/styles/createTheme'

const universal = {
    breakpoints: {
        values: {
            xs: 0,
            sm: 435,
            md: 960,
            lg: 1280,
            xl: 1920,
        }
    },
    typography: {
        fontSize: 14,
        h1: {
            fontSize: '2.7rem'
        },
        h2: {
            fontSize: '2.3rem'
        },
        h3: {
            fontSize: '1.75rem'
        },
        h4: {
            fontSize: '1.6rem'
        },
        h5: {
            fontSize: '1.45rem'
        },
        h6: {
            fontSize: '1.125rem'
        },
        body1: {
            letterSpacing: '0.0185em'
        },
        body2: {
            letterSpacing: '0.01em'
        }
    },
    shape: {
        borderRadius: 0,
    }
}

export const customTheme = (primary: string) => {
    const themeDark = createMuiTheme({
        palette: {
            type: 'dark',
            primary: {
                //light: '#43c0d5',
                main: primary,
                //dark: '#033944',
            },
            secondary: {
                light: '#d8eed4',
                main: '#8fbb87',
                dark: '#002634',
            },
            background: {
                paper: '#13181c',
                default: '#010203',
            },
            text: {
                primary: '#c6c4c4',
                secondary: '#acc9c5',
            },
            action: {
                hoverOpacity: 0.2,
            },
        },
        ...universal,
    })

    const themeLight = createMuiTheme({
        palette: {
            type: 'light',
            primary: {
                main: primary,
                //dark: '#033944',
            },
            secondary: {
                light: '#d8eed4',
                main: '#37936c',
                dark: '#002634',
            },
            background: {
                //paper: '#e8e8e8',
                paper: '#f7f7f7',
                //default: '#d2d2d2',
                //default: '#e3e3e3',
                default: '#ececec',
            },
            text: {
                primary: '#001f29',
                secondary: '#001820',
            },
            action: {
                hoverOpacity: 0.2,
            },
        },
        ...universal,
    })

    return {
        dark: themeDark,
        light: themeLight,
    }
}
