import React from 'react';
import { useParams } from 'react-router-dom';
import { addDoc, collection, serverTimestamp } from '@firebase/firestore';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, TextField, Button, FormControlLabel, Switch } from '@material-ui/core';

import { database } from '../../utils/settings/firebase';

const messageDialogDefaultContent = {
    content: '',
    isAnonymous: false,
    isOpen: false
};

function MessageDialog({ dialogContent, setDialogContent, auth }) {
    const { gameId } = useParams();

    function closeDialog() {
        setDialogContent(messageDialogDefaultContent);
    };

    function createMessage() {
        addDoc(collection(database, 'games', gameId, 'messages'), {
            userId: auth.currentUser.uid,
            content: dialogContent.content,
            isAnonymous: dialogContent.isAnonymous,
            createTimestamp: serverTimestamp()
        }).then(document => {
            closeDialog();
        });
    };

    return (
        <Dialog maxWidth='sm' fullWidth={true} open={dialogContent.isOpen} onClose={() => closeDialog()}>
            <DialogTitle>
                Mensagem
            </DialogTitle>
            <DialogContent>
                <Typography gutterBottom style={{ marginBottom: 16 }}>
                    A mensagem abaixo será enviada para todos os jogadores neste jogo.
                </Typography>
                <TextField
                    required
                    fullWidth
                    multiline
                    autoFocus
                    id='content'
                    label='Mensagem'
                    variant='outlined'
                    rows={5}
                    value={dialogContent.content}
                    onChange={(event) => setDialogContent({ ...dialogContent, content: event.target.value })}
                    style={{ marginBottom: 16 }}
                />
                <FormControlLabel
                    label='Enviar como anônimo'
                    control={
                        <Switch
                            color='primary'
                            checked={dialogContent.isAnonymous}
                            onChange={(event) => setDialogContent({ ...dialogContent, isAnonymous: event.target.checked })}
                        />
                    }
                />
            </DialogContent>
            <DialogActions>
                <Button color='primary' onClick={() => closeDialog()}>
                    Cancelar
                </Button>
                <Button color='primary' disabled={dialogContent.content.length === 0} onClick={() => createMessage()}>
                    Enviar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default MessageDialog;
export { messageDialogDefaultContent };
