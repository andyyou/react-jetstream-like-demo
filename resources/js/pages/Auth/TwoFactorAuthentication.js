import React, { useState, useCallback } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { useForm } from 'react-hook-form';

import AppLayout from '@/layouts/AppLayout';


const TwoFactorAuthentication = () => {
  const {
    register,
    handleSubmit,
  } = useForm();

  const [isRecovery, setIsRecovery] = useState(false);

  const submit = (data) => {
    Inertia.post(route('two-factor.login'), {
      ...data,
    }, {
      preserveState: false,
    });
  };

  const handleToggleRecovery = (e) => {
    e.preventDefault();
    setIsRecovery(isRecovery => !isRecovery);
  };

  return (
    <div className="mx-auto" style={{ maxWidth: 440, marginTop: 40 }}>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Two Factor Authentication</h5>
          <hr />

          {isRecovery ? (
            <p>
              Please confirm access to your account by entering one of your emergency recovery codes.
            </p>
          ) : (
            <p>
              Please confirm access to your account by entering the authentication code provided by your authenticator application.
            </p>
          )}

          <form onSubmit={handleSubmit(submit)}>
            {!isRecovery ? (
              <div className="mb-3">
                <label htmlFor="code" className="form-label">Code</label>
                <input type="text" inputMode="numeric" className="form-control" id="code" {...register('code')} key="code" />
              </div>
            ) : (
              <div className="mb-3">
                <label htmlFor="recovery_code" className="form-label">Recovery Code</label>
                <input type="text" className="form-control" id="recovery_code" {...register('recovery_code')} key="recovery_code" />
              </div>
            )}

            <div className="d-flex justify-content-end align-items-center">
              <button type="button" className="btn btn-link link-secondary mr-3" onClick={handleToggleRecovery}>
                {isRecovery ? "Use an authentication code" : "Use a recovery code"}
              </button>
              <button type="submit" className="btn btn-sm btn-dark">
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

TwoFactorAuthentication.layout = page => <AppLayout children={page} title="Two Factor Authentication" />
export default TwoFactorAuthentication;
