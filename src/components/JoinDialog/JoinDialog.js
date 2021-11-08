import React from 'react';
import { useHistory } from 'react-router-dom';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, TextField, Button } from '@material-ui/core';

function JoinDialog({ dialogContent, setDialogContent }) {
    const pageHistory = useHistory();

    function closeDialog() {
        setDialogContent({ ...dialogContent, open: false });
    };

    return (
        <Dialog maxWidth='sm' fullWidth={true} open={dialogContent.open} onClose={() => closeDialog()}>
            <DialogTitle>
                Entrar em um jogo
            </DialogTitle>
            <DialogContent>
                <Typography gutterBottom style={{ marginBottom: 16 }}>
                    Para entrar em um jogo, cole ou digite o ID abaixo (20 caracteres).
                </Typography>
                <TextField
                    required
                    fullWidth
                    autoFocus
                    id='id'
                    label='ID'
                    variant='outlined'
                    value={dialogContent.gameId}
                    onChange={(event) => setDialogContent({ ...dialogContent, id: event.target.value })}
                />
            </DialogContent>
            <DialogActions>
                <Button color='primary' onClick={() => closeDialog()}>
                    Cancelar
                </Button>
                <Button color='primary' disabled={dialogContent.id.length !== 20} onClick={() => pageHistory.push('/jogo/' + dialogContent.id)}>
                    Entrar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default JoinDialog;
