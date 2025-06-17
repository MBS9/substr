"use client";
import { Alert, Snackbar, AlertProps, SnackbarCloseReason, SvgIconTypeMap } from '@mui/material';
import Slide, { SlideProps } from '@mui/material/Slide';
import CheckIcon from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import React from 'react';
import { OverridableComponent } from '@mui/material/OverridableComponent';

type Severity = AlertProps['severity'] extends undefined | (infer U) ? U : never;

type NotificationContextType = {
    message: string;
    severity: Severity;
    setMessage: (message: string, severity?: Severity) => void;
}

function SlideTransition(props: SlideProps) {
    return <Slide {...props} direction="right" />;
}

const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined);

export function useNotification() {
    const context = React.useContext(NotificationContext);
    return context?.setMessage ?? (() => { throw new Error('Notification context not available'); });
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
const ICONS: { [Key in Severity]: OverridableComponent<SvgIconTypeMap<{}, "svg">> } = {
    'success': CheckIcon,
    'info': InfoIcon,
    'warning': WarningIcon,
    'error': ErrorIcon,
}

export function ShowNotification({ children }: { children: React.ReactNode }) {
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    const [message, setMessage] = React.useState<string>('');
    const [severity, setSeverity] = React.useState<Severity>('info');
    const setMessageCallback = React.useCallback((message: string, severity: Severity = 'info') => {
        setMessage(message);
        setSeverity(severity)
        setSnackbarOpen(true);
    }, [setMessage]);

    const handleClose = React.useCallback((event?: React.SyntheticEvent<any> | Event, reason?: SnackbarCloseReason) => {
        if (reason === 'clickaway')
            return;
        setSnackbarOpen(false);
    }, []);

    const Icon = React.useMemo(() => ICONS[severity], [severity]);

    return (
        <>
            <NotificationContext.Provider value={{ message: message, severity: severity, setMessage: setMessageCallback }}>
                {children}
            </NotificationContext.Provider>
            <Snackbar
                autoHideDuration={10000}
                open={snackbarOpen}
                slots={{ transition: SlideTransition }}
                onClose={handleClose}
            >
                <Alert
                    severity={severity}
                    variant='filled'
                    icon={<Icon fontSize='inherit' />}
                    sx={{ width: '100%' }}
                    onClose={handleClose}
                >
                    {message}
                </Alert>
            </Snackbar>
        </>
    );
}