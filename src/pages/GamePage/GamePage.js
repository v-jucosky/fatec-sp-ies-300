import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, onSnapshot, arrayUnion, arrayRemove, collection, getDocs, query, where } from 'firebase/firestore';
import { Container, Typography, Chip, Avatar, Divider, ButtonGroup, Button, Fab } from '@material-ui/core';

import { database } from '../../utils/settings/firebase';
import { gameStrut } from '../../utils/shared/game';

const LIMIT = 4;

function GamePage({ auth, profile, pageHistory }) {
    const { gameId } = useParams();
    const document = doc(database, 'games', gameId);
    const [game, setGame] = useState(gameStrut);
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        async function joinGame() {
            let game = (await getDoc(document)).data();

            if (!game.players.includes(auth.currentUser.uid)) {
                if (game.players.length > 2) {
                    alert('Número máximo de jogadores atingido');
                    pageHistory.push('/');
                } else {
                    await updateDoc(document, { players: arrayUnion(auth.currentUser.uid) });
                };
            };
        };

        joinGame();

        const unsubscribe = onSnapshot(document, snapshot => {
            let game = snapshot.data();
            let existingPlayers = players.map(player => player.user);
            let newPlayers = game.players.filter(player => !existingPlayers.includes(player));

            if (newPlayers.length > 0) {
                getDocs(query(collection(database, 'profiles'), where('user', 'in', newPlayers)))
                    .then(documents => {
                        documents.forEach(document => {
                            setPlayers(profiles => [...profiles, document.data()]);
                        });
                    });
            };

            setGame(game);
        });

        return unsubscribe;
    }, []);

    function startGame() {
        let decks = {};
        let sleep = [];

        for (let i = 0; i <= LIMIT; i++) {
            for (let j = i; j <= LIMIT; j++) {
                let x = i.toString();
                let y = j.toString();

                sleep.push({
                    id: x + '_' + y,
                    leftString: x,
                    leftNumber: i,
                    rightString: y,
                    rightNumber: j
                });
            };
        };

        game.players.forEach(player => {
            let tiles = [];

            for (let i = 0; i < 3; i++) {
                let tile = Math.floor(Math.random() * sleep.length);

                tiles.push(sleep[tile]);
                sleep.splice(tile, 1);
            };

            decks[player] = tiles;
        });

        updateDoc(document, { decks: decks, sleep: sleep, open: false });
    };

    function moveTile(tile) {
        let currentPlayer = game.players.indexOf(auth.currentUser.uid);
        let nextPlayer = undefined;

        if (currentPlayer >= game.players.length - 1) {
            nextPlayer = game.players[0];
        } else {
            nextPlayer = game.players[currentPlayer + 1];
        };

        updateDoc(document, { currentPlayer: nextPlayer, ['decks.' + auth.currentUser.uid]: arrayRemove(tile), moves: arrayUnion(tile) });
    };

    function getTile() {
        let tile = Math.floor(Math.random() * game.sleep.length);

        updateDoc(document, { ['decks.' + auth.currentUser.uid]: arrayUnion(game.sleep[tile]), sleep: arrayRemove(game.sleep[tile]) });
    };

    return (
        <>
            <Container maxWidth='md'>
                <div style={{ marginTop: 64 }}>
                    <Typography gutterBottom variant='h4'>
                        Jogo {gameId}
                    </Typography>
                    {game.owner === auth.currentUser.uid &&
                        <Button variant='contained' color='primary' onClick={() => startGame()} disabled={!game.open} style={{ marginRight: 16 }}>
                            Iniciar jogo
                        </Button>
                    }
                    {players.map(player => {
                        return (
                            <Chip label={player.displayName} avatar={<Avatar />} style={{ marginRight: 8 }} />
                        );
                    })}
                    <Divider style={{ margin: 16 }} />
                    {game.decks[auth.currentUser.uid]?.map(tile => {
                        return (
                            <ButtonGroup color='primary' variant='contained' key={tile.id} disabled={!(game.currentPlayer === auth.currentUser.uid && (game.moves.length === 0 || tile.leftNumber === game.moves[game.moves.length - 1].rightNumber))} onClick={() => moveTile(tile)} style={{ marginRight: 16 }}>
                                <Button>{tile.leftString}</Button>
                                <Button>{tile.rightString}</Button>
                            </ButtonGroup>
                        );
                    })}
                    <Divider style={{ margin: 16 }} />
                    {game.moves.map(tile => {
                        return (
                            <ButtonGroup color='primary' variant='contained' key={tile.id} style={{ marginRight: 16 }}>
                                <Button>{tile.leftString}</Button>
                                <Button>{tile.rightString}</Button>
                            </ButtonGroup>
                        );
                    })}
                </div>
            </Container>
            <Fab variant='extended' color='secondary' onClick={() => getTile()} disabled={game.sleep.length === 0} style={{ position: 'absolute', bottom: 64, right: 64 }} >
                Dorme
            </Fab>
        </>
    );
};

export default GamePage;
