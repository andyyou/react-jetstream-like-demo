import React from 'react';
import { Inertia } from '@inertiajs/inertia';
import { useForm } from 'react-hook-form';

import FlashMessage from '@/components/FlashMessage';

const AddTeamMemberForm = ({
  old,
  team,
  availableRoles,
  errors = {},
  status,
}) => {
  const {
    register,
    handleSubmit,
    watch,
  } = useForm();

  const watchRole = watch('role');

  const submit = (data) => {
    Inertia.post(route('team-members.store', team), {
      ...data
    }, {
      preserveState: false,
    });
  };

  return (
    <div className="row">
      <div className="col-4">
        <h5>Add Team Member</h5>
        <p>
          Add a new team member to your team, allowing them to collaborate with you.
        </p>
      </div>
      <div className="col-8">
        <div className="card">
          <div className="card-body">
            <div className="mb-3">
              Please provide the email address of the person you would like to add to this team. The email address must be associated with an existing account.
            </div>
            <form id="add-team-member-form" onSubmit={handleSubmit(submit)}>
              <div className="mb-3">
                <label htmlFor="email" className={['form-label', errors.email ? 'is-invalid' : ''].join(' ')}>Email</label>
                <input type="text" className="form-control" id="email" defaultValue={old.email} {...register('email')} />
                {errors.email && (
                  <div className="invalid-feedback">
                    {errors.email}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <ul className={['list-group', errors.role ? 'is-invalid' : ''].join(' ')}>
                  {availableRoles.map((role) => (
                    <label
                      key={role.key}
                      htmlFor={role.key}
                      className={['list-group-item', 'list-group-item-action', watchRole === role.key ? 'active' : ''].join(' ')}
                    >
                      <div className="d-flex align-items-center">
                        {role.name}
                        {watchRole === role.key && (
                          <svg className="ms-2" style={{ width: '1.25rem', height: '1.25rem' }} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        )}
                        <input
                          className="d-none"
                          type="radio"
                          id={role.key}
                          value={role.key}
                          {...register('role')}
                        />
                      </div>

                      <div className={[watchRole === role.key ? 'text-white-50' : 'text-black-50']}>
                        {role.description}
                      </div>
                    </label>
                  ))}
                </ul>
                {errors.role && (
                  <div className="invalid-feedback">
                    {errors.role}
                  </div>
                )}
              </div>
            </form>
          </div>
          <div className="card-footer text-end">
            {status === 'team-member-added' && (
              <FlashMessage duration={2}>
                <span className="me-3">Added!</span>
              </FlashMessage>
            )}

            <button type="submit" form="add-team-member-form" className="btn btn-sm btn-dark">Add</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTeamMemberForm;
