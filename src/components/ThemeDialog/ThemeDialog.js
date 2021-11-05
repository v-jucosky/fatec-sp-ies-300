import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from '@firebase/firestore';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, TextField, Checkbox, FormControlLabel, InputAdornment, Button } from '@material-ui/core';

import { database } from '../../utils/settings/firebase';

function ThemeDialog({ dialogData, setDialogData }) {
    const [themeData, setThemeData] = useState({ name: '', code: '', isPremium: false, price: 0 });

    function closeDialog() {
        setThemeData({ name: '', code: '', isPremium: false, price: 0 });
        setDialogData({ ...dialogData, open: false });
    };

    function createTheme() {
        addDoc(collection(database, 'themes'), {
            ...themeData,
            createTimestamp: serverTimestamp()
        }).then(() => {
            closeDialog();
        });
    };

    return (
        <Dialog maxWidth='sm' fullWidth={true} open={dialogData.open} onClose={() => closeDialog()}>
            <DialogTitle>
                Criar tema
            </DialogTitle>
            <DialogContent>
                <Typography gutterBottom style={{ marginBottom: 16 }}>
                    Crie um novo tema, que ficará disponível a todos os jogadores.
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
                    InputProps={{ startAdornment: <InputAdornment position='start'>#</InputAdornment> }}
                    style={{ marginBottom: 16 }}
                />
                <FormControlLabel
                    label='Este será um tema premium'
                    control={
                        <Checkbox
                            required
                            id='isPremium'
                            checked={themeData.isPremium}
                            onChange={() => setThemeData({ ...themeData, isPremium: !themeData.isPremium })}
                            style={{ marginLeft: 16 }}
                        />
                    }
                />
                {themeData.isPremium &&
                    <TextField
                        required
                        fullWidth
                        id='price'
                        label='Preço'
                        type='number'
                        variant='outlined'
                        value={themeData.price}
                        onChange={(event) => setThemeData({ ...themeData, price: event.target.value })}
                        InputProps={{ startAdornment: <InputAdornment position='start'>R$</InputAdornment> }}
                        style={{ marginTop: 16 }}
                    />
                }
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
