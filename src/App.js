import React, { useEffect, useState } from 'react';
import { Switch, Route, useHistory } from 'react-router-dom';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { AppBar, Toolbar, Button, Container, IconButton } from '@material-ui/core';
import { Home } from '@material-ui/icons';
import { MuiThemeProvider, createTheme } from '@material-ui/core/styles';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import GamePage from './pages/GamePage/GamePage';
import { firebaseApp, database } from './utils/settings/firebase';

function App() {
    const auth = getAuth(firebaseApp);
    const pageHistory = useHistory();
    const [profile, setProfile] = useState({});

    useEffect(() => {
        let unsubscribeProfile = () => { return };

        const unsubscribeAuth = onAuthStateChanged(auth, user => {
            if (user) {
                unsubscribeProfile = onSnapshot(doc(database, 'profiles', auth.currentUser.uid), snapshot => {
                    setProfile(snapshot.data());
                });
            } else {
                unsubscribeProfile();
                setProfile({});
            };
        });

        return (() => {
            unsubscribeProfile();
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
                            <Button color='inherit' onClick={() => pageHistory.push('/perfil')} style={{ marginRight: 16 }}>
                                Perfil
                            </Button>
                            <Button color='inherit' onClick={() => signOut(auth)}>
                                Sair
                            </Button>
                        </Toolbar>
                    </AppBar>
                    <Switch>
                        <Route exact path='/'>
                            <HomePage auth={auth} profile={profile} pageHistory={pageHistory} />
                        </Route>
                        <Route exact path='/perfil'>
                            <ProfilePage auth={auth} profile={profile} pageHistory={pageHistory} />
                        </Route>
                        <Route path='/jogo/:gameId'>
                            <GamePage auth={auth} profile={profile} pageHistory={pageHistory} />
                        </Route>
                    </Switch>
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
                            <RegisterPage auth={auth} pageHistory={pageHistory} />
                        </Route>
                        <Route path='/'>
                            <LoginPage auth={auth} pageHistory={pageHistory} />
                        </Route>
                    </Switch>
                </>
            )}
        </MuiThemeProvider>
    );
};

export default App;
