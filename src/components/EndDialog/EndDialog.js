import React from 'react';
import { useHistory } from 'react-router-dom';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from '@mui/material';

const endDialogDefaultContent = {
    isWinner: false,
    isOpen: false
};

function EndDialog({ dialogContent, setDialogContent }) {
    const pageHistory = useHistory();

    function closeDialog() {
        setDialogContent(endDialogDefaultContent);
    };

    return (
        <Dialog maxWidth='sm' fullWidth={true} open={dialogContent.isOpen} onClose={() => closeDialog()}>
            <DialogTitle>
                Fim
            </DialogTitle>
            <DialogContent>
                <Typography>
                    Esse jogo terminou. {dialogContent.isWinner ? 'Você venceu!' : 'Você perdeu.'}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button color='neutral' onClick={() => closeDialog()}>
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
export { endDialogDefaultContent };
