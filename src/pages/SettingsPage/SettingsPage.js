import React, { useState } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { Container, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, Box, Tabs, Tab } from '@material-ui/core';
import { Delete } from '@material-ui/icons';

import ThemeDialog from '../../components/ThemeDialog';
import { database } from '../../utils/settings/firebase';

function SettingsPage({ themes }) {
    const [tabState, setTabState] = useState({ index: 0 });
    const [themeDialogContent, setThemeDialogContent] = useState({ name: '', code: '', description: '', price: null, open: false });

    function deleteTheme(id) {
        deleteDoc(doc(database, 'themes', id));
    };

    return (
        <>
            <Container maxWidth='md' style={{ marginTop: 64, marginBottom: 64 }}>
                <Typography gutterBottom variant='h4'>
                    Configurações
                </Typography>
                <Box>
                    <Tabs value={tabState.index} onChange={(event, value) => setTabState({ ...tabState, index: value })}>
                        <Tab label='Temas' />
                        <Tab label='Sobre' />
                    </Tabs>
                    {tabState.index === 0 &&
                        <>
                            <TableContainer component={Paper} style={{ marginTop: 24 }}>
                                <Typography gutterBottom variant='h6' style={{ margin: 16 }}>
                                    Temas
                                </Typography>
                                <Typography gutterBottom style={{ margin: 16 }}>
                                    Temas não podem ser editados, pois são itens comercializados aos usuários da plataforma. Excluir um tema não o remove dos usuários que o adquiriram.
                                </Typography>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>
                                                Nome
                                            </TableCell>
                                            <TableCell>
                                                Cor de destaque
                                            </TableCell>
                                            <TableCell>
                                                Preço
                                            </TableCell>
                                            <TableCell>
                                                Ações
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {themes.map(theme => {
                                            return (
                                                <TableRow>
                                                    <TableCell>
                                                        {theme.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        {theme.code}
                                                    </TableCell>
                                                    <TableCell>
                                                        R$ {theme.price.toFixed(2)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button size='small' variant='contained' color='secondary' onClick={() => deleteTheme(theme.id)}>
                                                            <Delete />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Button variant='contained' color='primary' onClick={() => setThemeDialogContent({ name: '', code: '', description: '', price: null, open: true })} style={{ marginTop: 16 }}>
                                Novo tema
                            </Button>
                        </>
                    }
                    {tabState.index === 1 &&
                        <>
                            <Typography gutterBottom variant='h6' style={{ marginTop: 24 }}>
                                Sobre o desenvolvedor
                            </Typography>
                            <Typography gutterBottom>
                                Em desenvolvimento.
                            </Typography>
                        </>
                    }
                </Box>
            </Container>
            <ThemeDialog
                dialogContent={themeDialogContent}
                setDialogContent={setThemeDialogContent}
            />
        </>
    );
};

export default SettingsPage;
