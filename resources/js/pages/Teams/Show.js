import React from 'react';
import { usePage } from '@inertiajs/inertia-react';

import AppLayout from '@/layouts/AppLayout';
import UpdateTeamNameForm from '@/pages/Teams/UpdateTeamNameForm';
import AddTeamMemberForm from '@/pages/Teams/AddTeamMemberForm';
import TeamMembersForm from '@/pages/Teams/TeamMembersForm';
import DeleteTeamForm from '@/pages/Teams/DeleteTeamForm';

const Show = () => {
  const {
    props,
  } = usePage();

  const {
    _session,
    errors,
    team,
    user,
    availableRoles,
    permissions,
  } = props;

  const {
    _old_input: old = {},
  } = _session;

  return (
    <div className="container py-5">
      <div className="mb-5">
        <UpdateTeamNameForm
          errors={errors.updateTeam}
          status={_session.status}
          user={user}
          team={team}
        />
      </div>

      <div className="mb-5">
        <AddTeamMemberForm
          errors={errors.addTeamMember}
          status={_session.status}
          team={team}
          old={old}
          availableRoles={availableRoles.filter(role => role.key !== 'owner')}
        />
      </div>

      {team.users.length > 0 && (
        <div className="mb-5">
          <TeamMembersForm
            errors={errors.updateTeamMember}
            team={team}
            availableRoles={availableRoles.filter(role => role.key !== 'owner')}
          />
        </div>
      )}

      {(permissions.canDeleteTeam && !team.personal_team) && (
        <div className="mb-5">
          <DeleteTeamForm
            team={team}
          />
        </div>
      )}
    </div>
  );
};

Show.layout = page => (<AppLayout children={page} title="Team Settings" />);
export default Show;