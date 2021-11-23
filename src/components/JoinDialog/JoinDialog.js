import React from 'react';
import { useHistory } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, TextField, Button } from '@mui/material';

import { database } from '../../utils/settings/firebase';
import { MAXIMUM_NUMBER_PLAYERS } from '../../utils/settings/app';

const joinDialogDefaultContent = {
    gameId: '',
    isOpen: false
};

function JoinDialog({ dialogContent, setDialogContent, auth }) {
    const pageHistory = useHistory();

    function closeDialog() {
        setDialogContent(joinDialogDefaultContent);
    };

    function joinGame() {
        getDoc(doc(database, 'games', dialogContent.gameId))
            .then(document => {
                if (!document.exists()) {
                    alert('Este jogo não existe.');
                    return;
                };

                let game = document.data();

                if (!game.participantUserIds.includes(auth.currentUser.uid)) {
                    if (!game.isOpen) {
                        alert('Este jogo não está aberto.');
                        return;
                    } else if (game.participantUserIds.length >= MAXIMUM_NUMBER_PLAYERS) {
                        alert('Número máximo de jogadores atingido.');
                        return;
                    } else {
                        updateDoc(doc(database, 'games', dialogContent.gameId), {
                            participantUserIds: arrayUnion(auth.currentUser.uid)
                        }).then(() => {
                            pageHistory.push('/jogo/' + dialogContent.gameId);
                        });
                    };
                } else {
                    pageHistory.push('/jogo/' + dialogContent.gameId);
                };
            });
    };

    return (
        <Dialog maxWidth='sm' fullWidth={true} open={dialogContent.isOpen} onClose={() => closeDialog()}>
            <DialogTitle>
                Entrar em um jogo
            </DialogTitle>
            <DialogContent>
                <Typography style={{ marginBottom: 16 }}>
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
                <Button color='neutral' onClick={() => closeDialog()}>
                    Cancelar
                </Button>
                <Button color='primary' disabled={dialogContent.gameId.length !== 20} onClick={() => joinGame()}>
                    Entrar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default JoinDialog;
export { joinDialogDefaultContent };
