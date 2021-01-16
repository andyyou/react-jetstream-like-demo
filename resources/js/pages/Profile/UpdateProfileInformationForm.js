import React from 'react';
import { Inertia } from '@inertiajs/inertia';
import { useForm } from 'react-hook-form';

import FlashMessage from '@/components/FlashMessage';

const UpdateProfileInformationForm = ({
  user = {},
  errors = {},
  status,
}) => {
  const {
    register,
    handleSubmit,
  } = useForm();

  const submit = (data) => {
    Inertia.put(route('user-profile-information.update'), {
      ...data,
    }, {
      preserveState: false,
    });
  };

  return (
    <div className="row">
      <div className="col-4">
        <h5>Profile Information</h5>
        <p>
          Update your account's profile information and email address.
        </p>
      </div>
      <div className="col-8">
        <div className="card">
          <div className="card-body">
            <form
              id="update-profile-information-form"
              onSubmit={handleSubmit(submit)}
              noValidate=""
            >
              <div className="mb-3">
                <label htmlFor="name" className={['form-label', errors.name ? 'is-invalid' : ''].join(' ')}>Name</label>
                <input type="text" className="form-control" id="name" name="name" defaultValue={user.name} ref={register} />
                {(errors.name) && (
                  <div className="invalid-feedback">
                    {errors.name}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="email" className={['form-label', errors.email ? 'is-invalid' : ''].join(' ')}>Email</label>
                <input type="text" className="form-control" id="email" name="email" defaultValue={user.email} ref={register} />
                {(errors.email) && (
                  <div className="invalid-feedback">
                    {errors.email}
                  </div>
                )}
              </div>
            </form>
          </div>
          <div className="card-footer text-end">
            {status === 'profile-information-updated' && (
              <FlashMessage duration={2}>
                <span className="me-3">Saved!</span>
              </FlashMessage>
            )}
            
            <button type="submit" form="update-profile-information-form" className="btn btn-sm btn-dark">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfileInformationForm;