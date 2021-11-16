import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from '@material-ui/core';

const deleteDialogDefaultContent = {
    name: '',
    onDelete: () => { return; },
    open: false
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
        <Dialog maxWidth='sm' fullWidth={true} open={dialogContent.open} onClose={() => closeDialog()}>
            <DialogTitle>
                Excluir
            </DialogTitle>
            <DialogContent>
                <Typography gutterBottom>
                    Tem certeza de que deseja excluir “{dialogContent.name}”? Não será possível desfazer esta operação.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button color='primary' onClick={() => closeDialog()}>
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
