import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, addDoc, getDoc, setDoc, updateDoc, onSnapshot, arrayUnion, arrayRemove, collection, getDocs, query, where } from 'firebase/firestore';
import { Container, Typography, Chip, Avatar, ButtonGroup, Button, Fab, Card, CardContent, CardActions } from '@material-ui/core';

import { database } from '../../utils/settings/firebase';
import { buildSleep, getTileFromSleep, DECK_MAXIMUM_SIZE, PLAYER_LIMIT } from '../../utils/shared/game';

function GamePage({ auth, profile, pageHistory }) {
    const { gameId } = useParams();
    const [players, setPlayers] = useState([]);
    const [moves, setMoves] = useState([]);
    const [deck, setDeck] = useState({});
    const [game, setGame] = useState({
        owner: '',
        currentPlayer: '',
        players: [],
        sleep: [],
        moveCount: 0,
        createTimestamp: '',
        running: undefined,
        open: undefined
    });

    useEffect(() => {
        getDoc(doc(database, 'games', gameId))
            .then(document => {
                let players = document.data().players;

                if (!players.includes(auth.currentUser.uid)) {
                    if (players.length > PLAYER_LIMIT) {
                        alert('Número máximo de jogadores atingido');
                        pageHistory.push('/');
                    } else {
                        updateDoc(document, {
                            players: arrayUnion(auth.currentUser.uid)
                        });
                    };
                };
            });

        const unsubscribeGame = onSnapshot(doc(database, 'games', gameId), snapshot => {
            let game = snapshot.data();
            let existingPlayers = players.map(player => player.user);
            let newPlayers = game.players.filter(player => !existingPlayers.includes(player));

            newPlayers.forEach(player => {
                getDoc(doc(database, 'profiles', player))
                    .then(document => {
                        setPlayers(content => [...content, document.data()]);
                    });
            });

            setGame(game);
        });

        const unsubscribeMoves = onSnapshot(query(collection(database, 'games', gameId, 'moves')), snapshot => {
            snapshot.docChanges()
                .forEach(change => {
                    if (change.type === 'added') {
                        setMoves(content => [...content, change.doc.data()]);
                    };
                });
        });

        const unsubscribeDeck = onSnapshot(doc(database, 'games', gameId, 'decks', auth.currentUser.uid), snapshot => {
            setDeck(snapshot.data());
        });

        return (() => {
            unsubscribeDeck();
            unsubscribeGame();
            unsubscribeMoves();
        });
    }, []);

    function startGame() {
        let sleep = buildSleep();

        game.players.forEach(player => {
            let tiles = [];

            for (let i = 0; i < DECK_MAXIMUM_SIZE; i++) {
                tiles.push(getTileFromSleep(sleep));
            };

            setDoc(doc(database, 'games', gameId, 'decks', player), {
                tiles: tiles
            });
        });

        setDoc(doc(database, 'games', gameId, 'moves', '0'), {
            ...getTileFromSleep(sleep)
        });

        updateDoc(doc(database, 'games', gameId), {
            sleep: sleep,
            open: false,
            running: true
        });
    };

    function moveTile(tile) {
        let currentPlayer = game.players.indexOf(auth.currentUser.uid);
        let nextPlayer = undefined;

        if (currentPlayer >= game.players.length - 1) {
            nextPlayer = game.players[0];
        } else {
            nextPlayer = game.players[currentPlayer + 1];
        };

        updateDoc(doc(database, 'games', gameId), {
            currentPlayer: nextPlayer
        });

        updateDoc(doc(database, 'games', gameId, 'decks', auth.currentUser.uid), {
            tiles: arrayRemove(tile)
        });

        addDoc(collection(database, 'games', gameId, 'moves'), {
            ...tile
        });
    };

    function getTile() {
        let tile = Math.floor(Math.random() * game.sleep.length);

        updateDoc(doc(database, 'games', gameId, 'decks', auth.currentUser.uid), {
            tiles: arrayUnion(game.sleep[tile])
        });

        updateDoc(doc(database, 'games', gameId), {
            sleep: arrayRemove(game.sleep[tile])
        });
    };

    return (
        <>
            <Container maxWidth='md' style={{ marginTop: 64 }}>
                <Typography gutterBottom variant='h4'>
                    {gameId}
                </Typography>
                {players.map(player => {
                    return (
                        <Chip
                            label={player.displayName}
                            avatar={<Avatar />}
                            style={{ marginRight: 8, marginBottom: 8 }}
                        />
                    );
                })}
                {game.owner === auth.currentUser.uid &&
                    <Card style={{ marginTop: 8, marginBottom: 16 }}>
                        <CardContent>
                            <Typography gutterBottom variant='h6'>
                                Painel do administrador
                            </Typography>
                            <Typography gutterBottom>
                                Este painel só é visível a você, {profile.data().displayName}, por ter iniciado o jogo.
                                <br />
                                Quando todos os jogadores entrarem, clique em “Iniciar jogo” para iniciar a partida.
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button color='primary' variant='contained' onClick={() => startGame()} disabled={!game.open}>
                                Iniciar jogo
                            </Button>
                        </CardActions>
                    </Card>
                }
                <Card style={{ marginTop: 8, marginBottom: 24 }}>
                    <CardContent>
                        <Typography gutterBottom variant='h6'>
                            Meu deck
                        </Typography>
                        {!deck?.tiles &&
                            <Typography gutterBottom>
                                Você receberá suas peças aqui quando o administrador do jogo iniciar a partida...
                            </Typography>
                        }
                        {deck?.tiles &&
                            <Typography gutterBottom>
                                As peças ficarão disponíveis quando for a sua vez de jogar.
                            </Typography>
                        }
                    </CardContent>
                    {deck?.tiles &&
                        <CardActions>
                            {deck.tiles.map(tile => {
                                return (
                                    <ButtonGroup color='primary' variant='contained' onClick={() => moveTile(tile)}>
                                        <Button>{tile.leftString}</Button>
                                        <Button>{tile.rightString}</Button>
                                    </ButtonGroup>
                                );
                            })}
                        </CardActions>
                    }
                </Card>
                {moves.map(move => {
                    return (
                        <ButtonGroup color='primary' variant='contained' style={{ marginRight: 16, marginBottom: 16 }}>
                            <Button>{move.leftString}</Button>
                            <Button>{move.rightString}</Button>
                        </ButtonGroup>
                    );
                })}
            </Container>
            <Fab variant='extended' color='secondary' onClick={() => getTile()} disabled={game.sleep.length === 0 || game.open} style={{ position: 'absolute', bottom: 64, right: 64 }} >
                Dorme
            </Fab>
        </>
    );
};

export default GamePage;
