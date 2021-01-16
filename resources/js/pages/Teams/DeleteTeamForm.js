import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';

import Modal from '@/components/Modal';

const DeleteTeamForm = ({
  team,
}) => {
  const [isConfirmingTeamDeletion, setIsConfirmingTeamDeletion] = useState(false);

  const handleConfirmTeamDeletion = (e) => {
    e.preventDefault();
    setIsConfirmingTeamDeletion(true);
  };

  const handleClose = (e) => {
    e.preventDefault();
    setIsConfirmingTeamDeletion(false);
  };

  const handleConfirmed = (e) => {
    e.preventDefault();
    Inertia.delete(route('teams.destroy', team), {
      preserveState: false,
    });
  };

  return (
    <div className="row">
      <div className="col-4">
        <h5>Delete Team</h5>
        <p>
          Permanently delete this team. 
        </p>
      </div>
      <div className="col-8">
        <div className="card">
          <div className="card-body">
            <div className="mb-3">
              Once a team is deleted, all of its resources and data will be permanently deleted. Before deleting this team, please download any data or information regarding this team that you wish to retain. 
            </div>
            <button className="btn btn-sm btn-danger" onClick={handleConfirmTeamDeletion}>Delete</button>
            <Modal
              isActive={isConfirmingTeamDeletion}
              head={(
                <>
                  <h5>Delete Team</h5>
                  <button className="btn-close" onClick={handleClose}></button>
                </>
              )}
              footer={(
                <>
                  <button className="btn btn-sm btn-secondary" onClick={handleClose}>Nevermind</button>
                  <button className="btn btn-sm btn-primary" onClick={handleConfirmed}>Confirm</button>
                </>
              )}
            >
              <p>
                Are you sure you want to delete this team? Once a team is deleted, all of its resources and data will be permanently deleted. 
              </p>
            </Modal>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteTeamForm;