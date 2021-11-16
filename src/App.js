import React, { useEffect, useState } from 'react';
import { Switch, Route, useHistory } from 'react-router-dom';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { AppBar, Toolbar, Container, IconButton } from '@material-ui/core';
import { Home, AccountCircle, ExitToApp, Store, Settings } from '@material-ui/icons';
import { MuiThemeProvider, createTheme } from '@material-ui/core/styles';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import SettingsPage from './pages/SettingsPage';
import StorePage from './pages/StorePage';
import GamePage from './pages/GamePage';
import ProfileDialog, { profileDialogDefaultContent } from './components/ProfileDialog';
import { firebaseApp, database } from './utils/settings/firebase';
import { DEFAULT_ACCENT_COLOR_CODE } from './utils/settings/app';
import { arrayUpdate, objectUpdate } from './utils/utils/common';

function App() {
    const auth = getAuth(firebaseApp);
    const pageHistory = useHistory();
    const [profile, setProfile] = useState({});
    const [purchases, setPurchases] = useState([]);
    const [games, setGames] = useState([]);
    const [themes, setThemes] = useState([]);
    const [profileDialogContent, setProfileDialogContent] = useState(profileDialogDefaultContent);

    useEffect(() => {
        let unsubscribeProfile = () => { return };
        let unsubscribePurchases = () => { return };
        let unsubscribeGames = () => { return };
        let unsubscribeThemes = () => { return };

        const unsubscribeAuth = onAuthStateChanged(auth, user => {
            if (user) {
                unsubscribeProfile = onSnapshot(doc(database, 'profiles', auth.currentUser.uid), snapshot => {
                    objectUpdate(snapshot, profile, setProfile);
                });

                unsubscribePurchases = onSnapshot(query(collection(database, 'profiles', auth.currentUser.uid, 'purchases')), snapshot => {
                    arrayUpdate(snapshot, purchases, setPurchases);
                });

                unsubscribeGames = onSnapshot(query(collection(database, 'games'), where('participantUserIds', 'array-contains', auth.currentUser.uid)), snapshot => {
                    arrayUpdate(snapshot, games, setGames);
                });

                unsubscribeThemes = onSnapshot(query(collection(database, 'themes')), snapshot => {
                    arrayUpdate(snapshot, themes, setThemes);
                });
            } else {
                unsubscribeProfile();
                unsubscribePurchases();
                unsubscribeGames();
                unsubscribeThemes();
                setProfile({});
            };
        });

        return (() => {
            unsubscribeProfile();
            unsubscribePurchases();
            unsubscribeGames();
            unsubscribeThemes();
            unsubscribeAuth();
        });
    }, []);

    return (
        <MuiThemeProvider theme={createTheme({ palette: { primary: { main: profile.accentColor || DEFAULT_ACCENT_COLOR_CODE } } })}>
            {auth.currentUser ? (
                <>
                    <AppBar position='sticky'>
                        <Toolbar>
                            <IconButton color='inherit' onClick={() => pageHistory.push('/')}>
                                <Home />
                            </IconButton>
                            <Container style={{ flexGrow: 1 }} />
                            {profile.isSuperUser &&
                                <IconButton color='inherit' onClick={() => pageHistory.push('/configuracao')}>
                                    <Settings />
                                </IconButton>
                            }
                            <IconButton color='inherit' onClick={() => pageHistory.push('/loja')}>
                                <Store />
                            </IconButton>
                            <IconButton color='inherit' onClick={() => setProfileDialogContent({ ...profile, isOpen: true })}>
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
                        {profile.isSuperUser &&
                            <Route exact path='/configuracao'>
                                <SettingsPage auth={auth} profile={profile} themes={themes} />
                            </Route>
                        }
                        <Route path='/loja'>
                            <StorePage auth={auth} profile={profile} themes={themes} purchases={purchases} />
                        </Route>
                        <Route path='/jogo/:gameId'>
                            <GamePage auth={auth} profile={profile} games={games} />
                        </Route>
                    </Switch>
                    <ProfileDialog
                        dialogContent={profileDialogContent}
                        setDialogContent={setProfileDialogContent}
                        auth={auth}
                        purchases={purchases}
                    />
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
