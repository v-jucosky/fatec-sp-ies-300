import React from 'react';
import { useHistory } from 'react-router-dom';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from '@material-ui/core';

function EndDialog({ dialogContent, setDialogContent }) {
    const pageHistory = useHistory();

    function closeDialog() {
        setDialogContent({ ...dialogContent, open: false });
    };

    return (
        <Dialog maxWidth='sm' fullWidth={true} open={dialogContent.open} onClose={() => closeDialog()}>
            <DialogTitle>
                Fim
            </DialogTitle>
            <DialogContent>
                <Typography gutterBottom>
                    Esse jogo terminou.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button color='primary' onClick={() => closeDialog()}>
                    Cancelar
                </Button>
                <Button color='primary' onClick={() => pageHistory.push('/')}>
                    Sair
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EndDialog;
