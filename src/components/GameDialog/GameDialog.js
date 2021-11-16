import React from 'react';
import { useHistory } from 'react-router-dom';
import { addDoc, collection, serverTimestamp } from '@firebase/firestore';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, TextField, MenuItem, Button } from '@material-ui/core';

import { database } from '../../utils/settings/firebase';

function GameDialog({ dialogContent, setDialogContent, auth }) {
    const pageHistory = useHistory();

    function closeDialog() {
        setDialogContent({ ...dialogContent, open: false });
    };

    function createGame() {
        addDoc(collection(database, 'games'), {
            name: dialogContent.name,
            owner: auth.currentUser.uid,
            currentPlayer: auth.currentUser.uid,
            players: [
                auth.currentUser.uid
            ],
            sleep: [],
            deck: {},
            moves: 0,
            size: parseInt(dialogContent.size),
            running: false,
            open: true,
            createTimestamp: serverTimestamp(),
            updateTimestamp: serverTimestamp()
        }).then(document => {
            closeDialog();
            pageHistory.push('/jogo/' + document.id);
        });
    };

    return (
        <Dialog maxWidth='sm' fullWidth={true} open={dialogContent.open} onClose={() => closeDialog()}>
            <DialogTitle>
                Novo jogo
            </DialogTitle>
            <DialogContent>
                <Typography gutterBottom style={{ marginBottom: 16 }}>
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
                    id='size'
                    label='Tamanho'
                    variant='outlined'
                    value={dialogContent.size}
                    onChange={(event) => setDialogContent({ ...dialogContent, size: event.target.value })}
                >
                    <MenuItem value='6'>
                        6
                    </MenuItem>
                    <MenuItem value='8'>
                        8
                    </MenuItem>
                    <MenuItem value='10'>
                        10
                    </MenuItem>
                    <MenuItem value='12'>
                        12
                    </MenuItem>
                    <MenuItem value='14'>
                        14
                    </MenuItem>
                    <MenuItem value='16'>
                        16
                    </MenuItem>
                    <MenuItem value='18'>
                        18
                    </MenuItem>
                </TextField>
            </DialogContent>
            <DialogActions>
                <Button color='primary' onClick={() => closeDialog()}>
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
