import React from 'react';
import { Inertia } from '@inertiajs/inertia';
import { useForm } from 'react-hook-form';

import FlashMessage from '@/components/FlashMessage';

const UpdateTeamNameForm = ({
  errors = {},
  status,
  user,
  team,
}) => {
  const {
    register,
    handleSubmit,
  } = useForm();

  const submit = (data) => {
    Inertia.put(route('teams.update', team), {
      ...data
    }, {
      preserveState: false,
    });
  };

  return (
    <div className="row">
      <div className="col-4">
        <h5>Team Name</h5>
        <p>
          The team's name and owner information.
        </p>
      </div>
      <div className="col-8">
        <div className="card">
          <div className="card-body">
            <form id="update-team-name-form" onSubmit={handleSubmit(submit)}>
              <div className="mb-3">
                <label className="form-label">Team Owner</label>
                <div>{user.name}</div>
                <div><small className="text-muted">{user.email}</small></div>
              </div>

              <div className="mb-3">
                <label htmlFor="name" className={['form-label', errors.name ? 'is-invalid' : ''].join(' ')}>Team Name</label>
                <input type="text" className="form-control" id="name" defaultValue={team.name} {...register('name')} />
                {errors.name && (
                  <div className="invalid-feedback">
                    {errors.name}
                  </div>
                )}
              </div>
            </form>
          </div>
          <div className="card-footer text-end">
            {status === 'team-updated' && (
              <FlashMessage duration={2}>
                <span className="me-3">Updated!</span>
              </FlashMessage>
            )}

            <button type="submit" form="update-team-name-form" className="btn btn-sm btn-dark">
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateTeamNameForm;
