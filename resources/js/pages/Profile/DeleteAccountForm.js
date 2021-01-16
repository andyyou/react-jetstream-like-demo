import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { useForm } from 'react-hook-form';

import Modal from '@/components/Modal';

const DeleteAccountForm = ({
  errors = {},
}) => {
  const [isConfirmingUserDeletion, setIsConfirmingUserDeletion] = useState(false);

  const handleConfirmUserDeletion = (e) => {
    e.preventDefault();
    setIsConfirmingUserDeletion(true);

  }
  const handleClose = (e) => {
    e.preventDefault();
    setIsConfirmingUserDeletion(false);
  };

  const {
    register,
    handleSubmit,
  } = useForm();

  const submit = (data) => {
    Inertia.visit(route('current-user.destroy'), {
      method: 'delete',
      data,
      preserveState: true,
      onSuccess: (page) => {
        if (! page.props.errors.deleteUser) {
          setIsConfirmingUserDeletion(false);
        }
      },
    });
  };

  return (
    <div className="row">
      <div className="col-4">
        <h5>Delete Account</h5>
        <p>Permanently delete your account</p>
      </div>
      <div className="col-8">
        <div className="card">
          <div className="card-body">
            <div className="mb-3">
              Once your account is deleted, all of its resources and data will be permanently deleted. Before deleting your account, please download any data or information that you wish to retain. 
            </div>
            <Modal
              isActive={isConfirmingUserDeletion}
              head={(
                <>
                  <h5>Delete Account</h5>
                  <button className="btn-close" onClick={handleClose}></button>
                </>
              )}
              footer={(
                <>
                  <button type="button" className="btn btn-sm btn-secondary" onClick={handleClose}>Nevermind</button>
                  <button type="submit" className="btn btn-sm btn-danger" form="delete-account-form">Delete</button>
                </>
              )}
            >
              <form id="delete-account-form" onSubmit={handleSubmit(submit)}>
                <div>
                Are you sure you want to delete your account? Once your account is deleted, all of its resources and data will be permanently deleted. Please enter your password to confirm you would like to permanently delete your account.
                </div>
                <div className="mb-3">
                  <label 
                    htmlFor="password"
                    className={['form-label', errors.password ? 'is-invalid' : ''].join(' ')}
                  >
                    Password
                  </label>
                  <input 
                    type="password"
                    className="form-control" 
                    id="password" 
                    name="password" 
                    ref={register}
                  />
                  {errors.password && (
                    <div className="invalid-feedback">
                      {errors.password}
                    </div>
                  )}
                </div>
              </form>
            </Modal>

            <button type="button" className="btn btn-sm btn-danger" onClick={handleConfirmUserDeletion}>
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountForm;