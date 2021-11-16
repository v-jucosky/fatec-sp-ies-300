import React from 'react';
import { useHistory } from 'react-router-dom';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, TextField, Button } from '@material-ui/core';

const joinDialogDefaultContent = {
    gameId: '',
    isOpen: false
};

function JoinDialog({ dialogContent, setDialogContent }) {
    const pageHistory = useHistory();

    function closeDialog() {
        setDialogContent(joinDialogDefaultContent);
    };

    return (
        <Dialog maxWidth='sm' fullWidth={true} open={dialogContent.isOpen} onClose={() => closeDialog()}>
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
                    id='gameId'
                    label='ID do jogo'
                    variant='outlined'
                    value={dialogContent.gameId}
                    onChange={(event) => setDialogContent({ ...dialogContent, gameId: event.target.value })}
                />
            </DialogContent>
            <DialogActions>
                <Button color='primary' onClick={() => closeDialog()}>
                    Cancelar
                </Button>
                <Button color='primary' disabled={dialogContent.gameId.length !== 20} onClick={() => pageHistory.push('/jogo/' + dialogContent.gameId)}>
                    Entrar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default JoinDialog;
export { joinDialogDefaultContent };
