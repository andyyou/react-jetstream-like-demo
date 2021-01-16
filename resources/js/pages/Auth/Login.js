import React from 'react';
import { Inertia } from '@inertiajs/inertia';
import { usePage, InertiaLink } from '@inertiajs/inertia-react';
import { useForm } from 'react-hook-form';

import AppLayout from '@/layouts/AppLayout';

const Login = () => {
  const {
    props,
  } = usePage();

  const {
    _session,
    errors,
  } = props;

  const {
    _old_input: old = {},
  } = _session;

  const {
    register,
    handleSubmit,
  } = useForm();
  
  const submit = (data) => {
    Inertia.post(route('login'), {
      ...data,
    }, {
      preserveState: false,
    });
  };

  return (
    <div className="container">
      <div className="mx-auto" style={{ maxWidth: 440, marginTop: 40 }}>
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Login</h5>
            <hr />

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

              <div className="mb-3">
                <label htmlFor="password" className={['form-label', errors['password'] ? 'is-invalid' : ''].join(' ')}>Password</label>
                <input type="password" className="form-control" id="password" name="password" ref={register} />
                {errors['password'] && (
                  <div className="invalid-feedback">
                    {errors['password']}
                  </div>
                )}
              </div>

              <div className="mb-3 form-check">
                <input type="checkbox" className="form-check-input" id="remember_me" name="remember_me" defaultChecked={old.remember_me} ref={register} />
                <label className="form-check-label" htmlFor="remember_me">Remember Me</label>
              </div>

              <div className="d-flex justify-content-end align-items-center">
                <InertiaLink href={route('password.request')} className="link-secondary me-3">
                  Forgot Password ?
                </InertiaLink>
                <button type="submit" className="btn btn-sm btn-dark">
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

Login.layout = page => <AppLayout children={page} title="Login" />
export default Login;

