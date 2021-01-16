import React from 'react';
import { Inertia } from '@inertiajs/inertia';
import { usePage } from '@inertiajs/inertia-react';

const VerifyEmail = () => {
  const {
    props,
  } = usePage();

  const {
    _session,
  } = props;

  const {
    status,
  } = _session;

  const handleResendVerification = () => {
    Inertia.post(route('verification.send'), {}, {
      preserveState: false,
    });
  };

  const handleLogout = () => {
    Inertia.post(route('logout'), {}, {
      preserveState: false,
    });
  };

  return (
    <div className="mx-auto" style={{ maxWidth: 440, marginTop: 40 }}>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Verify Your Email</h5>
          <hr />

          {status === 'verification-link-sent' && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              A new verification link has been sent to the email.
              <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
          )}

          <p className="mb-3">
            Thanks for signing up! Before getting started, could you verify your email address by clicking on the link we just emailed to you? If you didn't receive the email, we will gladly send you another.
          </p>

          <div className="d-flex align-items-center justify-content-between">
            <button type="button" className="btn btn-sm btn-dark" onClick={handleResendVerification}>
              Resend Verification Email
            </button>
            
            <button type="button" className="btn btn-sm btn-link link-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;