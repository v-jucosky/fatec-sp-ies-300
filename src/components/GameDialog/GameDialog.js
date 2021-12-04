import React from 'react';
import { useHistory } from 'react-router-dom';
import { addDoc, collection, serverTimestamp } from '@firebase/firestore';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, TextField, MenuItem, Button } from '@mui/material';

import { database } from '../../utils/settings/firebase';
import { TILE_SIZES, DEFAULT_TILE_SIZE } from '../../utils/settings/app';

const gameDialogDefaultContent = {
    name: '',
    tileSize: DEFAULT_TILE_SIZE,
    isOpen: false
};

function GameDialog({ dialogContent, setDialogContent, auth }) {
    const pageHistory = useHistory();

    function closeDialog() {
        setDialogContent(gameDialogDefaultContent);
    };

    function createGame() {
        addDoc(collection(database, 'games'), {
            name: dialogContent.name,
            userId: auth.currentUser.uid,
            currentUserId: auth.currentUser.uid,
            participantUserIds: [
                auth.currentUser.uid
            ],
            sleepTiles: [],
            moves: [],
            deckContent: {},
            moveCount: 0,
            tileSize: parseInt(dialogContent.tileSize),
            isRunning: false,
            isOpen: true,
            createTimestamp: serverTimestamp(),
            updateTimestamp: serverTimestamp()
        }).then(document => {
            closeDialog();
            pageHistory.push('/jogo/' + document.id);
        });
    };

    return (
        <Dialog maxWidth='sm' fullWidth={true} open={dialogContent.isOpen} onClose={() => closeDialog()}>
            <DialogTitle>
                Novo jogo
            </DialogTitle>
            <DialogContent>
                <Typography style={{ marginBottom: 16 }}>
                    Nomeie a partida e selecione o tamanho máximo das peças. O jogo padrão utiliza peças numeradas de 0 a 6; aumentar este valor irá resultar em um jogo mais longo.
                </Typography>
                <TextField
                    required
                    fullWidth
                    autoFocus
                    id='name'
                    label='Nome'
                    variant='outlined'
                    value={dialogContent.name}
                    onChange={(event) => setDialogContent({ ...dialogContent, name: event.target.value })}
                    style={{ marginBottom: 16 }}
                />
                <TextField
                    select
                    required
                    fullWidth
                    id='tileSize'
                    label='Tamanho'
                    variant='outlined'
                    value={dialogContent.tileSize}
                    onChange={(event) => setDialogContent({ ...dialogContent, tileSize: event.target.value })}
                >
                    {TILE_SIZES.map(tileSize => {
                        return (
                            <MenuItem value={tileSize} key={tileSize}>
                                {tileSize}
                            </MenuItem>
                        );
                    })}
                </TextField>
            </DialogContent>
            <DialogActions>
                <Button color='neutral' onClick={() => closeDialog()}>
                    Cancelar
                </Button>
                <Button color='primary' disabled={dialogContent.name.length === 0} onClick={() => createGame()}>
                    Criar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default GameDialog;
export { gameDialogDefaultContent };
