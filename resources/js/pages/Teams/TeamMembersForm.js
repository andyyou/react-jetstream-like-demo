import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { useForm } from 'react-hook-form';

import Modal from '@/components/Modal';

const TeamMembersForm = ({
  team,
  availableRoles,
  errors = {},
}) => {
  const [isManagingTeamMember, setIsManagingTeamMember] = useState(false);

  const handleManageTeamMember = (member) => {
    return (e) => {
      e.preventDefault();
      setValue('member', member.id);
      setValue('role', member.membership.role);
      setIsManagingTeamMember(true);
    }
  };

  const handleClose = (e) => {
    e.preventDefault();
    setIsManagingTeamMember(false);
  };

  const handleDeleteTeamMember = (member) => {
    return (e) => {
      e.preventDefault();
      Inertia.delete(route('team-members.destroy', [team, member.id]), {
        preserveScroll: true,
        preserveState: true,
      });
    };
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
  } = useForm();

  const watchRole = watch('role');

  const submit = (data) => {
    Inertia.put(route('team-members.update', [team, data.member]), {
      role: data.role,
    }, {
      preserveState: true,
      onSuccess: (page) => {
        if (! page.props.errors.updateTeamMember) {
          setIsManagingTeamMember(false);
        }
      },
    });
  };

  return (
    <div className="row">
      <div className="col-4">
        <h5>Team Members</h5>
        <p>
          All of the people that are part of this team.
        </p>
      </div>
      <div className="col-8">
        <div className="card">
          <div className="card-body">
            {team.users.map((user) => (
              <div className="d-flex justify-content-between py-2" key={user.id}>
                <span>{user.name}</span>
                <div className="d-flex align-items-center">
                  <button className="btn btn-sm btn-light me-2" onClick={handleManageTeamMember(user)}>{user.membership.role}</button>
                  <button className="btn btn-sm btn-danger" onClick={handleDeleteTeamMember(user)}>Delete</button>
                </div>
              </div>
            ))}

            <Modal
              isActive={isManagingTeamMember}
              head={(
                <>
                  <h5>Manage Role</h5>
                  <button className="btn-close" onClick={handleClose}></button>
                </>
              )}
              footer={(
                <>
                  <button type="button" className="btn btn-sm btn-secondary" onClick={handleClose}>Nevermind</button>
                  <button type="submit" className="btn btn-sm btn-primary" form="update-team-member-form">Confirm</button>
                </>
              )}
            >
              <form id="update-team-member-form" onSubmit={handleSubmit(submit)}>
                <input type="hidden" {...register('member')} />
                <div className="mb-3">
                  <ul className={['list-group', errors.role ? 'is-invalid' : ''].join(' ')}>
                    {availableRoles.map((role) => (
                      <label
                        key={role.key}
                        htmlFor={`team-members-form-${role.key}`}
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
                            id={`team-members-form-${role.key}`}
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
            </Modal>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMembersForm;
