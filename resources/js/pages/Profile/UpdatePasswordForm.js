import React from 'react';
import { Inertia } from '@inertiajs/inertia';
import { useForm } from 'react-hook-form';

import FlashMessage from '@/components/FlashMessage';

const UpdatePasswordForm = ({
  errors = {},
  status,
}) => {
  const {
    register,
    handleSubmit,
  } = useForm();

  const submit = (data) => {
    Inertia.put(route('user-password.update'), {
      ...data,
    }, {
      preserveState: false,
    });
  };

  return (
    <div className="row">
      <div className="col-4">
        <h5>Update Password</h5>
        <p>
          Ensure your account is using a long, random password to stay secure.
        </p>
      </div>
      <div className="col-8">
        <div className="card">
          <div className="card-body">
            <form id="update-password-form" onSubmit={handleSubmit(submit)} noValidate="">
              <div className="mb-3">
                <label htmlFor="current_password" className={['form-label', errors.current_password ? 'is-invalid' : ''].join(' ')}>Current Password</label>
                <input type="password" className="form-control" id="current_password" {...register('current_password')} />
                {errors.current_password && (
                  <div className="invalid-feedback">
                    {errors.current_password}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="password" className={['form-label', errors.password ? 'is-invalid' : ''].join(' ')}>New Password</label>
                <input type="password" className="form-control" id="password" {...register('password')} />
                {errors.password && (
                  <div className="invalid-feedback">
                    {errors.password}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="password_confirmation" className={['form-label', errors.password_confirmation ? 'is-invalid' : ''].join(' ')}>Confirm Password</label>
                <input type="password" className="form-control" id="password_confirmation" {...register('password_confirmation')} />
                {errors.password_confirmation && (
                  <div className="invalid-feedback">
                    {errors.password_confirmation}
                  </div>
                )}
              </div>
            </form>
          </div>
          <div className="card-footer text-end">
            {status === 'password-updated' && (
              <FlashMessage duration={2}>
                <span className="me-3">Saved!</span>
              </FlashMessage>
            )}

            <button type="submit" form="update-password-form" className="btn btn-sm btn-dark">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatePasswordForm;
