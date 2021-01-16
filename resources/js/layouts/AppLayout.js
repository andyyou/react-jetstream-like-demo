import React, { useCallback } from 'react';
import { createGlobalStyle } from 'styled-components';
import { Inertia } from '@inertiajs/inertia';
import { usePage, InertiaLink } from '@inertiajs/inertia-react';

const GlobalStyle = createGlobalStyle`
  html,
  body,
  #app {
    height: 100%;
    font-family: "Source Sans Pro";
  }
`;

const AppLayout = ({ children }) => {
  const {
    props: {
      user,
    },
  } = usePage();

  const handleLogout = useCallback(async (e) => {
    e.preventDefault();
    axios.post(route('logout'));
    Inertia.reload();
  }, []);

  return (
    <div className="d-flex flex-column h-100">
      <nav className="navbar navbar-expand-md navbar-light border-bottom">
        <div className="container">
          <InertiaLink className="navbar-brand" href="/">Brand</InertiaLink>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar-content" aria-controls="navbar-content" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbar-content">
            <ul className="navbar-nav ms-auto ms-md-3">
              <li className="nav-item">
                <InertiaLink className="nav-link active" href={route('dashboard')}>Dashboard</InertiaLink>
              </li>
            </ul>
            <ul className="navbar-nav ms-auto">
              {!user ? (
                <>
                  <li className="nav-item">
                    <InertiaLink className="nav-link" href={route('register')}>Register</InertiaLink>
                  </li>
                  <li className="nav-item">
                    <InertiaLink className="nav-link" href={route('login')}>Login</InertiaLink>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" href="#" id="user-menu" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                      {user.name}
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="user-menu">
                      <li><h6 className="dropdown-header">Manage Account</h6></li>
                      <li><InertiaLink className="dropdown-item" href={route('profile.show')}>Profile</InertiaLink></li>
                      <li><InertiaLink className="dropdown-item" href={route('api-tokens.index')}>API Token</InertiaLink></li>
                      <li><hr className="dropdown-divider" /></li>
                      <li><h6 className="dropdown-header">Manage Team</h6></li>
                      <li><InertiaLink className="dropdown-item" href={route('teams.show', user.current_team)}>Team Settings</InertiaLink></li>
                      <li><InertiaLink className="dropdown-item" href={route('teams.create')}>Create New Team</InertiaLink></li>
                      <li><hr className="dropdown-divider" /></li>
                      <li><h6 className="dropdown-header">Switch Teams</h6></li>
                      {Object.values(user.all_teams).map(team => (
                        <li key={team.id}>
                          <a href="#" className="dropdown-item" onClick={(e) => {
                            e.preventDefault();
                            Inertia.put(route('current-team.update'), {
                              'team_id': team.id,
                            }, {
                              preserveState: false,
                            });
                          }}>
                            {team.id === user.current_team_id && (
                              <svg className="me-2 text-green-400" style={{ width: '1.25rem', height: '1.25rem' }} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            )}
                            
                            {team.name}
                          </a>
                        </li>
                      ))}
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <InertiaLink className="dropdown-item" href="#" onClick={handleLogout}>
                          Logout
                        </InertiaLink>
                      </li>
                    </ul>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
      <main className="flex-fill">
        {children}
      </main>
      <footer className="text-center p-4">
        CopyRight@andyyou
      </footer>
      <GlobalStyle />
    </div>
  );
};

export default AppLayout;