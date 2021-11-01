import React, { useState, useEffect } from 'react';
import { doc, addDoc, deleteDoc, onSnapshot, serverTimestamp, collection, query, where } from 'firebase/firestore';
import { Container, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core';
import { Delete, PlayArrow } from '@material-ui/icons';

import { database } from '../../utils/settings/firebase';

function HomePage({ auth, profile, pageHistory }) {
    const [games, setGames] = useState([]);

    useEffect(() => {
        const unsubscribe = onSnapshot(query(collection(database, 'games'), where('owner', '==', auth.currentUser.uid)), snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added') {
                    setGames(documents => [...documents, { id: change.doc.id, ...change.doc.data() }]);
                } else if (change.type === 'removed') {
                    setGames(documents => documents.filter(game => game.id !== change.doc.id));
                };
            });
        });

        return unsubscribe;
    }, []);

    function createGame() {
        addDoc(collection(database, 'games'), {
            owner: auth.currentUser.uid,
            currentPlayer: auth.currentUser.uid,
            players: [
                auth.currentUser.uid
            ],
            moves: [],
            sleep: [],
            decks: {},
            createTimestamp: serverTimestamp(),
            running: false,
            open: true
        }).then(document => {
            enterGame(document.id);
        });
    };

    function deleteGame(id) {
        deleteDoc(doc(database, 'games', id));
    };

    function enterGame(id) {
        pageHistory.push('/jogo/' + id);
    };

    return (
        <>
            <Container maxWidth='md'>
                <div style={{ marginTop: 64 }}>
                    <Typography gutterBottom variant='h4'>
                        Bem vindo, {profile.displayName}
                    </Typography>
                    <Button variant='contained' color='primary' onClick={() => createGame()} style={{ marginBottom: 16 }}>
                        Criar jogo
                    </Button>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    ID do jogo
                                </TableCell>
                                <TableCell>
                                    Jogadores
                                </TableCell>
                                <TableCell>
                                    Ações
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {games.map(game => {
                                return (
                                    <TableRow key={game.id}>
                                        <TableCell>
                                            {game.id}
                                        </TableCell>
                                        <TableCell>
                                            {game.players.length}
                                        </TableCell>
                                        <TableCell>
                                            <Button size='small' variant='contained' color='primary' disabled={!game.open || game.running} onClick={() => enterGame(game.id)} style={{ marginRight: 16 }}>
                                                <PlayArrow />
                                            </Button>
                                            <Button size='small' variant='contained' color='secondary' onClick={() => deleteGame(game.id)}>
                                                <Delete />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </Container>
        </>
    );
};

export default HomePage;
