import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from '@mui/material';

const deleteDialogDefaultContent = {
    name: '',
    onDelete: () => { return; },
    isOpen: false
};

function DeleteDialog({ dialogContent, setDialogContent }) {
    function closeDialog() {
        setDialogContent(deleteDialogDefaultContent);
    };

    function deleteItem() {
        dialogContent.onDelete();
        closeDialog();
    };

    return (
        <Dialog maxWidth='sm' fullWidth={true} open={dialogContent.isOpen} onClose={() => closeDialog()}>
            <DialogTitle>
                Excluir
            </DialogTitle>
            <DialogContent>
                <Typography>
                    Tem certeza de que deseja excluir “{dialogContent.name}”? Não será possível desfazer esta operação.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button color='neutral' onClick={() => closeDialog()}>
                    Cancelar
                </Button>
                <Button color='primary' onClick={() => deleteItem()}>
                    Excluir
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteDialog;
export { deleteDialogDefaultContent };
