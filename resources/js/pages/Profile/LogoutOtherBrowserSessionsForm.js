import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { useForm } from 'react-hook-form';

import Modal from '@/components/Modal';

const LogoutOtherBrowserSessionsForm = ({
  sessions,
  errors = {},
}) => {
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);

  const handleConfirmLogout = (e) => {
    e.preventDefault();
    setIsConfirmingLogout(true);
  };

  const handleClose = (e) => {
    e.preventDefault();
    setIsConfirmingLogout(false);
  };

  const {
    register,
    handleSubmit,
  } = useForm();

  const submit = (data) => {
    Inertia.visit(route('other-browser-sessions.destroy'), {
      method: 'delete',
      data,
      preserveState: true,
      onSuccess: (page) => {
        if (! page.props.errors.logoutOtherBrowserSessions) {
          setIsConfirmingLogout(false);
        }
      },
    });
  };

  return (
    <div className="row">
      <div className="col-4">
        <h5>Browser Sessions</h5>
        <p>
          Manage and logout your active sessions on other browsers and devices.
        </p>
      </div>
      <div className="col-8">
        <div className="card">
          <div className="card-body">
            <p>
              If necessary, you may logout of all of your other browser sessions across all of your devices. Some of your recent sessions are listed below; however, this list may not be exhaustive. If you feel your account has been compromised, you should also update your password.
            </p>

            {sessions.map((session, index) => (
              <div className="d-flex my-3" key={`${session.ip_address}-${index}`}>
                <div style={{ width: 50 }}>
                  {session.agent.is_desktop ? (
                    <svg fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M0 0h24v24H0z" stroke="none"></path><rect x="7" y="4" width="10" height="16" rx="1"></rect><path d="M11 5h2M12 17v.01"></path>
                    </svg>
                  )}
                </div>
                <div className="d-flex flex-column">
                  <div>
                    {`${session.agent.platform} - ${session.agent.browser}`}
                  </div>
                  <div>
                      <small className="text-muted">
                        {`${session.ip_address}, `}
                        {session.is_current_device ? (
                          <>This device</>
                        ) : (
                          <>Last active {session.last_active}</>
                        )}
                      </small>
                  </div>
                </div>
              </div>
            ))}

            <Modal
              isActive={isConfirmingLogout}
              head={(
                <>
                  <h5>Logout Other Browser Sessions</h5>
                  <button className="btn-close" onClick={handleClose}></button>
                </>
              )}
              footer={(
                <>
                  <button type="button" className="btn btn-sm btn-secondary" onClick={handleClose}>Nevermind</button>
                  <button type="submit" className="btn btn-sm btn-primary" form="logout-other-browser-sessions-form">Logout</button>
                </>
              )}
            >
              <form id="logout-other-browser-sessions-form" onSubmit={handleSubmit(submit)}>
                <div>
                  Please enter your password to confirm you would like to logout of your other browser sessions across all of your devices.
                </div>
                <div className="mb-3">
                  <label
                    htmlFor="password"
                    className={['form-label', errors.password ? 'is-invalid' : ''].join(' ')}
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    {...register('password')}
                  />
                  {errors.password && (
                    <div className="invalid-feedback">
                      {errors.password}
                    </div>
                  )}
                </div>
              </form>
            </Modal>

            <button type="button" className="btn btn-sm btn-dark" onClick={handleConfirmLogout}>
              Logout Other Browser Sessions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutOtherBrowserSessionsForm;
