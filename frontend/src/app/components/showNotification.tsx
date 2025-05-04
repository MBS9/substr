import { IconButton, Snackbar } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import React from 'react';

type NotificationContextType = {
    message: string;
    setMessage: (message: string) => void;
}

const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined);

export function useNotification() {
    const context = React.useContext(NotificationContext);
    return context?.setMessage ?? (() => { console.error('ERROR! Notification context not available'); });
}

export function ShowNotification({ children }: { children: React.ReactNode }) {
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    const [message, setMessage] = React.useState<string>('');
    const setMessageCallback = React.useCallback((message: string) => {
        setMessage(message);
        setSnackbarOpen(true);
    }, [setMessage]);

    return (
        <>
            <NotificationContext.Provider value={{ message: message, setMessage: setMessageCallback }}>
                {children}
            </NotificationContext.Provider>
            <Snackbar
                message={message}
                autoHideDuration={10000}
                open={snackbarOpen}
                onClose={() => setSnackbarOpen(false)}
                action={
                    <IconButton size="small" color="inherit" onClick={() => setSnackbarOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                }
            />
        </>
    );
}