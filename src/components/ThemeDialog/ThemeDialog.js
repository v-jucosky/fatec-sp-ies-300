import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from '@firebase/firestore';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, TextField, Button } from '@material-ui/core';

import { database } from '../../utils/settings/firebase';

function ThemeDialog({ dialogData, setDialogData }) {
    const [themeData, setThemeData] = useState({ name: '', code: '' });

    function closeDialog() {
        setThemeData({ name: '', code: '' });
        setDialogData({ ...dialogData, open: false });
    };

    function createTheme() {
        addDoc(collection(database, 'themes'), {
            name: themeData.name,
            code: themeData.code,
            createTimestamp: serverTimestamp()
        }).then(() => {
            closeDialog();
        });
    };

    return (
        <Dialog open={dialogData.open} onClose={() => closeDialog()}>
            <DialogTitle>
                Tema
            </DialogTitle>
            <DialogContent>
                <Typography gutterBottom style={{ marginBottom: 16 }}>
                    Crie um novo tema.
                </Typography>
                <TextField
                    required
                    fullWidth
                    autoFocus
                    id='name'
                    label='Nome'
                    variant='outlined'
                    value={themeData.name}
                    onChange={(event) => setThemeData({ ...themeData, name: event.target.value })}
                    style={{ marginBottom: 16 }}
                />
                <TextField
                    required
                    fullWidth
                    id='code'
                    label='Código'
                    variant='outlined'
                    value={themeData.code}
                    onChange={(event) => setThemeData({ ...themeData, code: event.target.value })}
                />
            </DialogContent>
            <DialogActions>
                <Button color='primary' onClick={() => closeDialog()}>
                    Cancelar
                </Button>
                <Button color='primary' onClick={() => createTheme()}>
                    Salvar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ThemeDialog;
