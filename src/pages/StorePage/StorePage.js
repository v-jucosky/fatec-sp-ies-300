import React, { useState } from 'react';
import { Container, Typography, Card, CardContent, CardActions, Grid, Button } from '@material-ui/core';

import PurchaseDialog from '../../components/PurchaseDialog';
import { FEATURE, THEME } from '../../utils/settings/app';

function StorePage({ auth, profile, themes, purchases }) {
    const [purchaseDialogContent, setPurchaseDialogContent] = useState({ type: '', item: { name: '', price: 0 }, open: false });

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
                <Grid container spacing={3} style={{ marginBottom: 16 }}>
                    {themes.map(theme => {
                        return (
                            <Grid item xs={6} md={3} style={{ display: 'flex' }}>
                                <Card style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', width: '100%' }}>
                                    <CardContent>
                                        <Typography gutterBottom variant='h6' style={{ color: theme.code }}>
                                            {theme.name}
                                        </Typography>
                                        <Typography gutterBottom>
                                            {theme.description}
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button color='primary' size='small' disabled={purchases.map(purchase => purchase.item.id).includes(theme.id)} onClick={() => setPurchaseDialogContent({ type: THEME, item: { ...theme }, open: true })}>
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
                <Typography gutterBottom variant='h6'>
                    Recursos
                </Typography>
                <Typography gutterBottom style={{ marginBottom: 16 }}>
                    Adquira recursos e funcionalidades de jogo.
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6} style={{ display: 'flex' }}>
                        <Card style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', width: '100%' }}>
                            <CardContent>
                                <Typography gutterBottom variant='h6'>
                                    Destaque de jogadas possíveis
                                </Typography>
                                <Typography gutterBottom>
                                    As jogadas possíveis ficarão em destaque. Note que não há como desativar este recurso após adquiri-lo.
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button disabled color='primary' size='small' onClick={() => setPurchaseDialogContent({ type: FEATURE, item: { name: 'Destaque de jogadas possíveis', price: 29.99, change: { highlightTiles: true } }, open: true })}>
                                    Em breve
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
            <PurchaseDialog
                dialogContent={purchaseDialogContent}
                setDialogContent={setPurchaseDialogContent}
                auth={auth}
                profile={profile}
            />
        </>
    );
};

export default StorePage;
