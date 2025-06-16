"use client";
import { Alert, Snackbar, AlertProps } from '@mui/material';
import Slide, { SlideProps } from '@mui/material/Slide';
import React from 'react';

type Severity = AlertProps['severity'];

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
    return context?.setMessage ?? (() => { throw new Error('ERROR! Notification context not available'); });
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

    return (
        <>
            <NotificationContext.Provider value={{ message: message, severity: severity, setMessage: setMessageCallback }}>
                {children}
            </NotificationContext.Provider>
            <Snackbar
                autoHideDuration={10000}
                open={snackbarOpen}
                slots={{ transition: SlideTransition }}
                onClose={() => setSnackbarOpen(false)}

            >
                <Alert
                    severity={severity}
                    variant='filled'
                    sx={{ width: '100%' }}
                    onClose={() => setSnackbarOpen(false)}
                >
                    {message}
                </Alert>
            </Snackbar>
        </>
    );
}