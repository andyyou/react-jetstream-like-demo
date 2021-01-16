import React from 'react';
import { Inertia } from '@inertiajs/inertia';
import { usePage } from '@inertiajs/inertia-react';
import { useForm } from 'react-hook-form';

import AppLayout from '@/layouts/AppLayout';

const getToken = (url) => {
  const regex = /reset-password\/([\w]+)\?email=([\w@.]+)/;
  const matches = decodeURIComponent(url).match(regex);

  return matches[1];
};

const ResetPassword = () => {
  const {
    props,
    url,
  } = usePage();

  const {
    _session,
    errors,
    request,
  } = props;

  const {
    _old_input: old = {},
  } = _session;

  const {
    register,
    handleSubmit,
  } = useForm();

  const submit = (data) => {
    const token = getToken(url);
    Inertia.post(route('password.update'), {
      ...data,
      token: token,
    }, {
      preserveState: false,
    });
  };

  return (
    <div className="mx-auto" style={{ maxWidth: 440, marginTop: 40 }}>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Reset Password</h5>
          <hr />

          <form onSubmit={handleSubmit(submit)} noValidate="">
            <div className="mb-3">
              <label htmlFor="email" className={['form-label', errors['email'] ? 'is-invalid' : ''].join(' ')}>Email</label>
              <input type="email" className="form-control" id="email" name="email" defaultValue={old.email || request.email} ref={register} />
              {errors['email'] && (
                <div className="invalid-feedback">
                  {errors['email']}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="password" className={['form-label', errors['password'] ? 'is-invalid' : ''].join(' ')}>Password</label>
              <input type="password" className="form-control" id="password" name="password" ref={register} />
              {errors['password'] && (
                <div className="invalid-feedback">
                  {errors['password']}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="password_confirmation" className={['form-label', errors['password_confirmation'] ? 'is-invalid' : ''].join(' ')}>Password Confirm</label>
              <input type="password" className="form-control" id="password_confirmation" name="password_confirmation" value={old.password_confirmation} ref={register} />
              {errors['password_confirmation'] && (
                <div className="invalid-feedback">
                  {errors['password_confirmation']}
                </div>
              )}
            </div>
            
            <div className="d-flex justify-content-end align-items-center">
              <button type="submit" className="btn btn-sm btn-dark">
                Reset Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

ResetPassword.layout = page => <AppLayout children={page} title="Reset Password" />
export default ResetPassword;