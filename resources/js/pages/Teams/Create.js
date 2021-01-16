import React from 'react';
import { Inertia } from '@inertiajs/inertia';
import { usePage } from '@inertiajs/inertia-react';
import { useForm } from 'react-hook-form';

import AppLayout from '@/layouts/AppLayout';

const Create = () => {
  const {
    props,
  } = usePage();

  const {
    _session,
    errors,
    user,
  } = props;

  const {
    _old_input: old = {},
  } = _session;

  const {
    register,
    handleSubmit,
  } = useForm();

  const submit = (data) => {
    Inertia.post(route('teams.store'), {
      ...data
    });
  };

  return (
    <div className="container py-5">
      <div className="row mb-5">
        <div className="col-4">
          <h5>Team Details</h5>
          <p>
            Create a new team to collaborate with others on projects.
          </p>
        </div>
        <div className="col-8">
          <div className="card">
            <div className="card-body">
              <form id="create-team" onSubmit={handleSubmit(submit)}>
                <div className="mb-3">
                  <label className="form-label">Team Owner</label>
                  <div>
                    {user.name}
                    <div>
                      <small className="text-muted">{user.email}</small>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="name" className={['form-label', errors.createTeam && errors.createTeam.name ? 'is-invalid' : ''].join(' ')}>Team Name</label>
                  <input type="text" className="form-control" id="name" name="name" defaultValue={old.name} ref={register} />
                  {(errors.createTeam && errors.createTeam.name) && (
                    <div className="invalid-feedback">
                      {errors.createTeam.name}
                    </div>
                  )}
                </div>
              </form>
            </div>
            <div className="card-footer text-end">
              <button type="submit" form="create-team" className="btn btn-sm btn-dark">Create</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Create.layout = page => (<AppLayout children={page} title="Create Team" />);
export default Create;