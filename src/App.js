import React, { useEffect, useState } from 'react';
import { Switch, Route, useHistory } from 'react-router-dom';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { AppBar, Toolbar, Container, IconButton } from '@material-ui/core';
import { Home, AccountCircle, ExitToApp, Settings } from '@material-ui/icons';
import { MuiThemeProvider, createTheme } from '@material-ui/core/styles';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import SettingsPage from './pages/SettingsPage';
import GamePage from './pages/GamePage/GamePage';
import { firebaseApp, database } from './utils/settings/firebase';
import ProfileDialog from './components/ProfileDialog';

function App() {
    const auth = getAuth(firebaseApp);
    const pageHistory = useHistory();
    const [profile, setProfile] = useState({});
    const [themes, setThemes] = useState([]);
    const [games, setGames] = useState([]);
    const [dialogData, setDialogData] = useState({ open: false });

    useEffect(() => {
        let unsubscribeProfile = () => { return };
        let unsubscribeThemes = () => { return };
        let unsubscribeGames = () => { return };

        const unsubscribeAuth = onAuthStateChanged(auth, user => {
            if (user) {
                unsubscribeProfile = onSnapshot(doc(database, 'profiles', auth.currentUser.uid), snapshot => {
                    console.log('PERFIL ATUALIZADO');
                    setProfile(snapshot.data());
                });

                unsubscribeThemes = onSnapshot(query(collection(database, 'themes')), snapshot => {
                    snapshot.docChanges()
                        .forEach(change => {
                            if (change.type === 'added') {
                                console.log('TEMA ADICIONADO');
                                setThemes(content => [...content, { id: change.doc.id, ...change.doc.data() }]);
                            } else if (change.type === 'removed') {
                                console.log('TEMA REMOVIDO');
                                setThemes(content => content.filter(theme => theme.id !== change.doc.id));
                            };
                        });
                });

                unsubscribeGames = onSnapshot(query(collection(database, 'games'), where('players', 'array-contains', auth.currentUser.uid)), snapshot => {
                    snapshot.docChanges()
                        .forEach(change => {
                            if (change.type === 'added') {
                                console.log('JOGO ADICIONADO');
                                setGames(content => [...content, { id: change.doc.id, ...change.doc.data() }]);
                            } else if (change.type === 'removed') {
                                console.log('JOGO REMOVIDO');
                                setGames(content => content.filter(game => game.id !== change.doc.id));
                            };
                        });
                });
            } else {
                unsubscribeProfile();
                unsubscribeThemes();
                unsubscribeGames();
                setProfile({});
            };
        });

        return (() => {
            unsubscribeProfile();
            unsubscribeThemes();
            unsubscribeGames();
            unsubscribeAuth();
        });
    }, []);

    return (
        <MuiThemeProvider theme={createTheme({ palette: profile.palette })}>
            {auth.currentUser ? (
                <>
                    <AppBar position='sticky'>
                        <Toolbar>
                            <IconButton color='inherit' onClick={() => pageHistory.push('/')}>
                                <Home />
                            </IconButton>
                            <Container style={{ flexGrow: 1 }} />
                            {profile.superUser &&
                                <IconButton color='inherit' onClick={() => pageHistory.push('/configuracoes')}>
                                    <Settings />
                                </IconButton>
                            }
                            <IconButton color='inherit' onClick={() => setDialogData({ ...dialogData, open: true })}>
                                <AccountCircle />
                            </IconButton>
                            <IconButton color='inherit' onClick={() => signOut(auth)}>
                                <ExitToApp />
                            </IconButton>
                        </Toolbar>
                    </AppBar>
                    <Switch>
                        <Route exact path='/'>
                            <HomePage auth={auth} profile={profile} games={games} />
                        </Route>
                        {profile.superUser &&
                            <Route exact path='/configuracoes'>
                                <SettingsPage auth={auth} profile={profile} themes={themes} />
                            </Route>
                        }
                        <Route path='/jogo/:gameId'>
                            <GamePage auth={auth} profile={profile} />
                        </Route>
                    </Switch>
                    <ProfileDialog dialogData={dialogData} setDialogData={setDialogData} auth={auth} profile={profile} themes={themes} />
                </>
            ) : (
                <>
                    <AppBar position='sticky'>
                        <Toolbar>
                            <IconButton color='inherit' onClick={() => pageHistory.push('/')}>
                                <Home />
                            </IconButton>
                        </Toolbar>
                    </AppBar>
                    <Switch>
                        <Route exact path='/registrar'>
                            <RegisterPage auth={auth} />
                        </Route>
                        <Route path='/'>
                            <LoginPage auth={auth} />
                        </Route>
                    </Switch>
                </>
            )}
        </MuiThemeProvider>
    );
};

export default App;
