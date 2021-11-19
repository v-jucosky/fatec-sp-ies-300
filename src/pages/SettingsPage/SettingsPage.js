import React, { useState } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { Container, Typography, IconButton, Button, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, Box, Tabs, Tab } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';

import ThemeDialog, { themeDialogDefaultContent } from '../../components/ThemeDialog';
import DeleteDialog, { deleteDialogDefaultContent } from '../../components/DeleteDialog';
import { database } from '../../utils/settings/firebase';

function SettingsPage({ themes }) {
    const [tabIndex, setTabIndex] = useState(0);
    const [themeDialogContent, setThemeDialogContent] = useState(themeDialogDefaultContent);
    const [deleteDialogContent, setDeleteDialogContent] = useState(deleteDialogDefaultContent);

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
                    <Tabs value={tabIndex} onChange={(event, value) => setTabIndex(value)} style={{ marginBottom: 16 }}>
                        <Tab label='Temas' />
                        <Tab label='Sobre' />
                    </Tabs>
                    {tabIndex === 0 &&
                        <>
                            <TableContainer component={Paper} style={{ marginBottom: 16 }}>
                                <Typography gutterBottom variant='h6' style={{ margin: 16 }}>
                                    Temas
                                </Typography>
                                <Typography gutterBottom style={{ margin: 16 }}>
                                    O nome e a cor dos temas não podem ser editados, pois são itens comercializados aos usuários da plataforma. Excluir um tema não o remove dos usuários que o adquiriram.
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
                                                        {theme.colorCode}
                                                    </TableCell>
                                                    <TableCell>
                                                        R${theme.price.toFixed(2)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <IconButton size='small' variant='contained' color='primary' onClick={() => setThemeDialogContent({ ...themeDialogContent, ...theme, themeId: theme.id, colorCode: theme.colorCode.substring(1), isOpen: true })} style={{ marginRight: 4 }}>
                                                            <Edit />
                                                        </IconButton>
                                                        <IconButton size='small' variant='contained' color='secondary' onClick={() => setDeleteDialogContent({ ...deleteDialogContent, name: theme.name, onDelete: () => deleteTheme(theme.id), isOpen: true })}>
                                                            <Delete />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Button variant='contained' color='primary' onClick={() => setThemeDialogContent({ ...themeDialogContent, isOpen: true })}>
                                Novo tema
                            </Button>
                        </>
                    }
                    {tabIndex === 1 &&
                        <>
                            <Typography gutterBottom variant='h6'>
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
            <DeleteDialog
                dialogContent={deleteDialogContent}
                setDialogContent={setDeleteDialogContent}
            />
        </>
    );
};

export default SettingsPage;
