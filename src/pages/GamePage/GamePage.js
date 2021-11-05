import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { doc, addDoc, getDoc, setDoc, updateDoc, onSnapshot, arrayUnion, arrayRemove, collection, query, increment, serverTimestamp } from 'firebase/firestore';
import { Container, Typography, Chip, Avatar, ButtonGroup, Button, Fab, Card, CardContent, CardActions } from '@material-ui/core';

import { database } from '../../utils/settings/firebase';
import { buildSleep, getTileFromSleep, DECK_MAXIMUM_SIZE, PLAYER_LIMIT } from '../../utils/shared/game';

function GamePage({ auth, profile }) {
    const pageHistory = useHistory();
    const { gameId } = useParams();
    const [players, setPlayers] = useState([{ ...profile }]);
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
                try {
                    let game = document.data();

                    if (!game.players.includes(auth.currentUser.uid)) {
                        if (!game.open) {
                            alert('Este jogo não está aberto.');
                            pageHistory.push('/');
                        } else if (game.players.length >= PLAYER_LIMIT) {
                            alert('Número máximo de jogadores atingido.');
                            pageHistory.push('/');
                        } else {
                            updateDoc(doc(database, 'games', gameId), {
                                players: arrayUnion(auth.currentUser.uid)
                            });
                        };
                    };
                } catch (error) {
                    alert('Não foi possível entrar neste jogo.');
                    pageHistory.push('/');
                };
            });

        const unsubscribeGame = onSnapshot(doc(database, 'games', gameId), snapshot => {
            let game = snapshot.data();
            let existingPlayers = players.map(player => player.userId);
            let newPlayers = game.players.filter(player => !existingPlayers.includes(player));

            newPlayers.forEach(newPlayer => {
                getDoc(doc(database, 'profiles', newPlayer))
                    .then(document => {
                        setPlayers(content => [content, { userId: document.id, ...document.data() }]);
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

        addDoc(collection(database, 'games', gameId, 'moves'), {
            move: 1,
            player: auth.currentUser.uid,
            tile: getTileFromSleep(sleep),
            onTimestamp: serverTimestamp()
        });

        updateDoc(doc(database, 'games', gameId), {
            sleep: sleep,
            open: false,
            running: true,
            moveCount: increment(1)
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

        addDoc(collection(database, 'games', gameId, 'moves'), {
            move: game.moveCount + 1,
            player: auth.currentUser.uid,
            tile: tile,
            onTimestamp: serverTimestamp()
        });

        updateDoc(doc(database, 'games', gameId, 'decks', auth.currentUser.uid), {
            tiles: arrayRemove(tile)
        });

        updateDoc(doc(database, 'games', gameId), {
            moveCount: increment(1),
            currentPlayer: nextPlayer
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
                                Este painel só é visível a você, {profile.displayName}, por ter iniciado o jogo. Quando todos os jogadores entrarem, clique em “Iniciar jogo” para iniciar a partida.
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button color='primary' onClick={() => navigator.clipboard.writeText(gameId)}>
                                Copiar ID
                            </Button>
                            <Button color='primary' onClick={() => startGame()} disabled={!game.open}>
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
                                Você receberá suas peças aqui quando o administrador do jogo iniciar a partida.
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
                                    <ButtonGroup color='primary' disabled={game.currentPlayer !== auth.currentUser.uid} onClick={() => moveTile(tile)}>
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
                            <Button>{move.tile.leftString}</Button>
                            <Button>{move.tile.rightString}</Button>
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
