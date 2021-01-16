import React from 'react';
import { Inertia } from '@inertiajs/inertia';
import { usePage, InertiaLink } from '@inertiajs/inertia-react';
import { useForm } from 'react-hook-form';

import AppLayout from '@/layouts/AppLayout';

const Register = () => {
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
    Inertia.post(route('register'), {
      ...data,
    }, {
      preserveState: false,
    });
  };

  return (
    <div className="mx-auto" style={{ maxWidth: 440, marginTop: 40 }}>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Register</h5>
          <hr />

          <form onSubmit={handleSubmit(submit)} noValidate="">
            <div className="mb-3">
              <label htmlFor="name" className={['form-label', errors['name'] ? 'is-invalid' : ''].join(' ')}>Name</label>
              <input type="text" className="form-control" id="name" name="name" defaultValue={old.name} ref={register} />
              {errors['name'] && (
                <div className="invalid-feedback">
                  {errors['name']}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="email" className={['form-label', errors['email'] ? 'is-invalid' : ''].join(' ')}>Email</label>
              <input type="text" className="form-control" id="email" name="email" defaultValue={old.value} ref={register} />
              {errors['email'] && (
                <div className="invalid-feedback">
                  {errors['email']}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="password" className={['form-label', errors['password'] ? 'is-invalid' : ''].join(' ')}>Password</label>
              <input type="password" className="form-control" id="password" name="password" defaultValue={old.password} ref={register} />
              {errors['password'] && (
                <div className="invalid-feedback">
                  {errors['password']}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="password_confirmation" className={['form-label', errors['password_confirmation'] ? 'is-invalid' : ''].join(' ')}>Password Confirmation</label>
              <input type="password" className="form-control" id="password_confirmation" name="password_confirmation" defaultValue={old.password_confirmation} ref={register} />
              {errors['password_confirmation'] && (
                <div className="invalid-feedback">
                  {errors['password_confirmation']}
                </div>
              )}
            </div>
            
            <div className="d-flex justify-content-end align-items-center">
              <InertiaLink href={route('login')} className="link-secondary me-3">
                Already have account?
              </InertiaLink>
              <button type="submit" className="btn btn-sm btn-dark">
                Register
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

Register.layout = page => <AppLayout children={page} title="Register" />
export default Register;