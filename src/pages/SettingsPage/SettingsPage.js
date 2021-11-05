import React, { useState } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { Container, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, Box, Tabs, Tab } from '@material-ui/core';
import { Delete } from '@material-ui/icons';

import ThemeDialog from '../../components/ThemeDialog';
import { database } from '../../utils/settings/firebase';

function SettingsPage({ auth, profile, themes }) {
    const [tabData, setTabData] = useState({ index: 0 });
    const [dialogData, setDialogData] = useState({ open: false });

    function deleteTheme(themeId) {
        deleteDoc(doc(database, 'themes', themeId));
    };

    return (
        <>
            <Container maxWidth='md' style={{ marginTop: 64 }}>
                <Typography gutterBottom variant='h4'>
                    Configurações
                </Typography>
                <Box>
                    <Tabs value={tabData.index} onChange={(event, value) => setTabData({ ...tabData, index: value })}>
                        <Tab label='Temas' />
                        <Tab label='Sobre' />
                    </Tabs>
                    {tabData.index === 0 &&
                        <>
                            <TableContainer component={Paper} style={{ marginTop: 24 }}>
                                <Typography gutterBottom variant='h6' style={{ margin: 16 }}>
                                    Temas disponíveis
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
                                                Ações
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {themes.map(theme => {
                                            return (
                                                <TableRow key={theme.id}>
                                                    <TableCell>
                                                        {theme.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        {theme.code}
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
                            <Button variant='contained' color='primary' onClick={() => setDialogData({ ...dialogData, open: true })} style={{ marginTop: 16 }}>
                                Novo tema
                            </Button>
                        </>
                    }
                    {tabData.index === 1 &&
                        <>
                            <Typography gutterBottom variant='h6' style={{ marginTop: 24 }}>
                                Sobre o desenvolvedor
                            </Typography>
                            <Typography gutterBottom variant='subtitle1'>
                                Em desenvolvimento.
                            </Typography>
                        </>
                    }
                </Box>
            </Container>
            <ThemeDialog dialogData={dialogData} setDialogData={setDialogData} />
        </>
    );
};

export default SettingsPage;
