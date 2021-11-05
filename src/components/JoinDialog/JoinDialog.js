import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, TextField, Button } from '@material-ui/core';

function JoinDialog({ dialogData, setDialogData }) {
    const pageHistory = useHistory();
    const [joinData, setJoinData] = useState({ gameId: '' });

    function closeDialog() {
        setJoinData({ gameId: '' });
        setDialogData({ ...dialogData, open: false });
    };

    function joinGame() {
        pageHistory.push('/jogo/' + joinData.gameId);
    };

    return (
        <Dialog open={dialogData.open} onClose={() => closeDialog()}>
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
                    value={joinData.gameId}
                    onChange={(event) => setJoinData({ ...joinData, gameId: event.target.value })}
                />
            </DialogContent>
            <DialogActions>
                <Button color='primary' onClick={() => closeDialog()}>
                    Cancelar
                </Button>
                <Button color='primary' disabled={joinData.gameId.length !== 20} onClick={() => joinGame()}>
                    Entrar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default JoinDialog;
