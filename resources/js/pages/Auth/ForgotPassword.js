import React from 'react';
import { Inertia } from '@inertiajs/inertia';
import { usePage } from '@inertiajs/inertia-react';
import { useForm } from 'react-hook-form';

import AppLayout from '@/layouts/AppLayout';

const ForgotPassword = () => {
  const {
    props,
  } = usePage();

  const {
    _session,
    errors,
  } = props;

  const {
    status,
    _old_input: old = {},
  } = _session;

  const {
    register,
    handleSubmit,
  } = useForm();

  const submit = (data) => {
    Inertia.post(route('password.email'), {
      ...data,
    }, {
      preserveState: false,
    });
  };

  return (
    <div className="mx-auto" style={{ maxWidth: 440, marginTop: 40 }}>
      <div className="card">
        <div className="card-body">
          <h5>Reset Password</h5>
          <hr />

          {status && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              {status}
              <button type="button" className="btn-close" data-dismiss="alert" aria-label="Close"></button>
            </div>
          )}
          
          <p>
            Forgot your password? No problem. Just let us know your email address and we will email you a password reset link that will allow you to choose a new one.
          </p>

          <form onSubmit={handleSubmit(submit)} noValidate="">
            <div className="mb-3">
              <label htmlFor="email" className={['form-label', errors['email'] ? 'is-invalid' : ''].join(' ')}>Email</label>
              <input type="text" className="form-control" id="email" name="email" defaultValue={old.email} ref={register} />
              {errors['email'] && (
                <div className="invalid-feedback">
                  {errors['email']}
                </div>
              )}
            </div>

            <div className="d-flex justify-content-end align-items-center">
              <button type="submit" className="btn btn-sm btn-dark">
                Send Password Reset Link
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

ForgotPassword.layout = page => <AppLayout children={page} title="Forgot Password" />
export default ForgotPassword;