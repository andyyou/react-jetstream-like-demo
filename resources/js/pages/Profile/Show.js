import React from 'react';
import { usePage } from '@inertiajs/inertia-react';

import AppLayout from '@/layouts/AppLayout';
import UpdateProfileInformationForm from '@/pages/Profile/UpdateProfileInformationForm';
import UpdatePasswordForm from '@/pages/Profile/UpdatePasswordForm';
import TwoFactorAuthenticationForm from '@/pages/Profile/TwoFactorAuthenticationForm';
import LogoutOtherBrowserSessionsForm from '@/pages/Profile/LogoutOtherBrowserSessionsForm';
import DeleteAccountForm from '@/pages/Profile/DeleteAccountForm';

const Show = () => {
  const {
    props,
  } = usePage();

  const {
    _session,
    errors,
    user,
    sessions,
  } = props;

  return (
    <>
      <div className="container py-5">
        <div className="mb-5">
          <UpdateProfileInformationForm
            user={user}
            errors={errors.updateProfileInformation}
            status={_session.status}
          />
        </div>

        <div className="mb-5">
          <UpdatePasswordForm
            errors={errors.updatePassword}
            status={_session.status}
          />
        </div>

        <div className="mb-5">
          <TwoFactorAuthenticationForm
            user={user}
          />
        </div>

        <div className="mb-5">
          <LogoutOtherBrowserSessionsForm
            sessions={sessions}
            errors={errors.logoutOtherBrowserSessions}
          />
        </div>

        <div className="mb-5">
          <DeleteAccountForm
            errors={errors.deleteUser}
          />
        </div>
      </div>
    </>
  );
};

Show.layout = page => (<AppLayout children={page} title="User Profile" />);
export default Show;