import React, { useReducer } from 'react';
import { Inertia } from '@inertiajs/inertia';

import ConfirmsPassword from '@/components/ConfirmsPassword';

const TwoFactorAuthenticationForm = ({
  user,
}) => {
  const [state, dispatch] = useReducer((state, {
    type,
    payload
  }) => {
    switch (type) {
      case 'SET_QRCODE':
        return {
          ...state,
          qrCode: payload,
        };
      case 'SET_RECOVERY_CODES':
        return {
          ...state,
          recoveryCodes: payload,
        };
    }
  }, {
    qrCode: undefined,
    recoveryCodes: [],
  });

  const {
    qrCode,
    recoveryCodes,
  } = state;

  const handleEnableTwoFactorAuthentication = async () => {
    await Inertia.post('/user/two-factor-authentication');
    let response = await axios.get('/user/two-factor-qr-code');
    dispatch({
      type: 'SET_QRCODE',
      payload: response.data,
    });

    response = await axios.get('/user/two-factor-recovery-codes');
    dispatch({
      type: 'SET_RECOVERY_CODES',
      payload: response.data,
    });
  };

  const handleShowRecoveryCodes = async () => {
    const response = await axios.get('/user/two-factor-recovery-codes');
    dispatch({
      type: 'SET_RECOVERY_CODES',
      payload: response.data,
    });
  };

  const handleRegenerateRecoveryCodes = async () => {
    await axios.post('/user/two-factor-recovery-codes');
    const response = await axios.get('/user/two-factor-recovery-codes');
    dispatch({
      type: 'SET_RECOVERY_CODES',
      payload: response.data,
    });
  };

  const handleDisableTwoFactorAuthentication = async () => {
    await Inertia.delete('/user/two-factor-authentication');
  };

  return (
    <div className="row">
      <div className="col-4">
        <h5>Two Factor Authentication</h5>
        <p>
          Add additional security to your account using two factor authentication.
        </p>
      </div>
      <div className="col-8">
        <div className="card">
          <div className="card-body">
            {user.two_factor_enabled ? (
              <h5 className="card-title">You have enabled two factor authentication.</h5>
            ) : (
              <h5 className="card-title">You have not enabled two factor authentication.</h5>
            )}

            <p className="text-muted">
              When two factor authentication is enabled, you will be prompted for a secure, random token during authentication. You may retrieve this token from your phone's Google Authenticator application.
            </p>
            
            <div className="py-3">
              {user.two_factor_enabled ? (
                <>
                  {qrCode && (
                    <>
                      <p>
                        Two factor authentication is now enabled. Scan the following QR code using your phone's authenticator application. 
                      </p>
                      <div dangerouslySetInnerHTML={{ __html: qrCode.svg }} className="mb-3" />
                    </>
                  )}

                  {recoveryCodes.length > 0 && (
                    <>
                      <p>
                        Store these recovery codes in a secure password manager. They can be used to recover access to your account if your two factor authentication device is lost. 
                      </p>
                      <div className="bg-light p-3 mb-3">
                        {recoveryCodes.map((code) => (
                          <div key={code}>
                            {code}
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {recoveryCodes.length > 0 ? (
                    <ConfirmsPassword id="regenerate-recorvery-codes" onConfirmed={handleRegenerateRecoveryCodes}>
                      <button className="btn btn-sm btn-light me-2">Regenerate Recovery Codes</button>
                    </ConfirmsPassword>
                  ) : (
                    <ConfirmsPassword id="show-recorvery-codes" onConfirmed={handleShowRecoveryCodes}>
                      <button className="btn btn-sm btn-light me-2">Show Recovery Codes</button>
                    </ConfirmsPassword>
                  )}

                  <ConfirmsPassword id="disable-two-factor-authentication" onConfirmed={handleDisableTwoFactorAuthentication}>
                    <button className="btn btn-sm btn-danger">Disable</button>
                  </ConfirmsPassword>
                </>
              ) : (
                <>
                  <ConfirmsPassword id="enable-two-factor-authentication" onConfirmed={handleEnableTwoFactorAuthentication}>
                    <button className="btn btn-sm btn-dark">Enable</button>
                  </ConfirmsPassword>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuthenticationForm;