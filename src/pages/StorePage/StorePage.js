import React, { useState } from 'react';
import { Container, Typography, Card, CardContent, CardActions, Grid, Button } from '@material-ui/core';

import PurchaseDialog from '../../components/PurchaseDialog';

function StorePage({ auth, profile, themes, purchases }) {
    const [dialogContent, setDialogContent] = useState({});
    const [dialogState, setDialogState] = useState({ open: false });

    function openDialog(item, type) {
        setDialogContent({ type: type, item: { ...item } });
        setDialogState({ ...dialogState, open: true });
    };

    return (
        <>
            <Container maxWidth='md' style={{ marginTop: 64, marginBottom: 64 }}>
                <Typography gutterBottom variant='h4'>
                    Loja
                </Typography>
                <Typography gutterBottom variant='h6'>
                    Temas
                </Typography>
                <Typography gutterBottom style={{ marginBottom: 16 }}>
                    Adquira temas para mudar como seu perfil é visto por outros usuários e a aparência da interface.
                </Typography>
                <Grid container spacing={3}>
                    {themes.map(theme => {
                        return (
                            <Grid item xs={3} style={{ display: 'flex' }}>
                                <Card style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', width: '100%' }}>
                                    <CardContent>
                                        <Typography gutterBottom variant='h6'>
                                            {theme.name}
                                        </Typography>
                                        <Typography gutterBottom>
                                            {theme.description}
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button color='primary' size='small' disabled={purchases.map(purchase => purchase.item.id).includes(theme.id)} onClick={() => openDialog(theme, 'theme')}>
                                            {theme.price > 0 ?
                                                'R$' + theme.price.toFixed(2)
                                                :
                                                'Grátis'
                                            }
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            </Container>
            <PurchaseDialog dialogState={dialogState} setDialogState={setDialogState} dialogContent={dialogContent} auth={auth} profile={profile} />
        </>
    );
};

export default StorePage;
