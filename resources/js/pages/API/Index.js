import React, { useReducer, useEffect } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { usePage } from '@inertiajs/inertia-react';
import { useForm } from 'react-hook-form';

import AppLayout from '@/layouts/AppLayout';
import FlashMessage from '@/components/FlashMessage';
import Modal from '@/components/Modal';

const Index = () => {
  const {
    props,
  } = usePage();

  const {
    _session,
    errors,
    availablePermissions = [],
    defaultPermissions,
    tokens = [],
  } = props;

  const {
    _old_inputs: old = {},
  } = _session;

  // State
  const [state, dispatch] = useReducer((state, action) => {
    const {
      type,
      payload,
    } = action;

    switch (type) {
      case 'UPDATE':
        return {
          ...state,
          ...payload,
        };
    }
  }, {
    isApiTokenCreated: false,
    isDisplayingToken: false,
    isEditingToken: false,
    isDeletingToken: false,
    willDeleteToken: undefined,
  });

  const {
    isApiTokenCreated,
    isDisplayingToken,
    isEditingToken,
    isDeletingToken,
    willDeleteToken,
  } = state;

  // Create Api Token
  const {
    register: createApiTokenRegister,
    handleSubmit: handleCreateApiTokenSubmit,
  } = useForm({
    defaultValues: {
      name: old.name,
      permissions: defaultPermissions,
    },
  });

  const onCreateApiToken = (data) => {
    Inertia.post(route('api-tokens.store'), {
      ...data,
    }, {
      preserveState: false,
    });
  };

  const handleCreateApiTokenModal = (active) => {
    return (e) => {
      e.preventDefault();
      dispatch({
        type: 'UPDATE',
        payload: {
          isDisplayingToken: active,
        },
      });
    };
  };

  // Update Api Token
  const {
    register: updateApiTokenRegister,
    handleSubmit: handleUpdateApiTokenSubmit,
    setValue: setUpdateApiTokenValue,
  } = useForm();

  const onUpdateApiToken = ({
    token_id,
    permissions,
  }) => {
    Inertia.put(route('api-tokens.update', token_id), {
      permissions,
    }, {
      preserveState: true,
      onFinish: () => {
        dispatch({
          type: 'UPDATE',
          payload: {
            isEditingToken: false,
          },
        });
      },
    });
  };

  const handleUpdateApiTokenModal = (active) => {
    return (e) => {
      e.preventDefault();
      dispatch({
        type: 'UPDATE',
        payload: {
          isEditingToken: active,
        },
      });
    };
  };

  const handleUpdateApiTokenPermissions = (token) => {
    return (e) => {
      e.preventDefault();
      setUpdateApiTokenValue('token_id', token.id);
      setUpdateApiTokenValue('permissions', token.abilities);

      dispatch({
        type: 'UPDATE',
        payload: {
          isEditingToken: true,
        },
      });
    };
  };

  // Delete Api Token
  const handleDeleteApiTokenModal = (active) => {
    return (e) => {
      e.preventDefault();
      dispatch({
        type: 'UPDATE',
        payload: {
          isDeletingToken: active,
        },
      });
    };
  };

  const handleChangeDeleteApiToken = (token) => {
    return (e) => {
      e.preventDefault();
      dispatch({
        type: 'UPDATE',
        payload: {
          willDeleteToken: token,
          isDeletingToken: true,
        },
      });
    };
  };

  const handleDeleteApiToken = (e) => {
    e.preventDefault();
    Inertia.delete(route('api-tokens.destroy', willDeleteToken), {
      preserveState: false,
      onFinish: () => {
        dispatch({
          type: 'UPDATE',
          payload: {
            willDeleteToken: undefined,
            isDeletingToken: false,
          },
        });
      },
    });
  };

  // Handle Inertia status
  useEffect(() => {
    switch (_session.status) {
      case 'api-token-created':
        dispatch({
          type: 'UPDATE',
          payload: {
            isApiTokenCreated: true,
            isDisplayingToken: true,
          },
        });
        break;
    }
  }, [_session]);

  return (
    <>
      <div className="container py-5">

        {/* Create API Token  */}
        <div className="row mb-5">
          <div className="col-4">
            <h5>Create API Token</h5>
            <p>
              API tokens allow third-party services to authenticate with our application on your behalf.
            </p>
          </div>
          <div className="col-8">
            <div className="card">
              <div className="card-body">
                <form id="create-api-token" onSubmit={handleCreateApiTokenSubmit(onCreateApiToken)} noValidate="">
                  <div className="mb-3">
                    <label htmlFor="name" className={['form-label', errors['createApiToken'] && errors['createApiToken']['name'] ? 'is-invalid' : ''].join(' ')}>Name</label>
                    <input type="text" className="form-control" id="name" name="name" ref={createApiTokenRegister} />
                    {(errors['createApiToken'] && errors['createApiToken']['name']) && (
                      <div className="invalid-feedback">
                        {errors['createApiToken']['name']}
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Permissions</label>
                    <div>
                      {availablePermissions.map((permission) => (
                        <div className="form-check form-check-inline" key={`available-permission-${permission}`}>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            name="permissions"
                            id={`available-permission-${permission}`}
                            value={permission}
                            ref={createApiTokenRegister}
                          />
                          <label className="form-check-label" htmlFor={`available-permission-${permission}`}>
                            {permission.charAt(0).toUpperCase() + permission.slice(1)}
                          </label>
                        </div>
                      ))}
                    </div>

                    {/* API Token Modal */}
                    <Modal 
                      isActive={isDisplayingToken}
                      head={(
                        <>
                          <h5>API Token</h5>
                          <button className="btn-close" onClick={handleCreateApiTokenModal(false)}></button>
                        </>
                      )}
                      footer={(
                        <>
                          <button type="button" className="btn btn-sm btn-primary" onClick={handleCreateApiTokenModal(false)}>Close</button>
                        </>
                      )}
                    >
                      <>
                        <div className="mb-3">
                          Please copy your new API token. For your security, it won't be shown again. 
                        </div>
                        <div className="bg-light p-2 rounded">
                          {_session._flash.token}
                        </div>
                      </>
                    </Modal>
                  </div>
                </form>
              </div>
              <div className="card-footer text-end">
                {isApiTokenCreated && (
                  <FlashMessage
                    duration={2}
                  >
                    <span className="me-3">Created!</span>
                  </FlashMessage>
                )}
                
                <button type="submit" form="create-api-token" className="btn btn-sm btn-dark">
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Manage API Tokens.  */}
        {tokens.length > 0 && (
          <div className="row mb-5">
            <div className="col-4">
              <h5>Manage API Tokens</h5>
              <p>
                You may delete any of your existing tokens if they are no longer needed.
              </p>
            </div>
            <div className="col-8">
              <div className="card">
                <div className="card-body">
                  <Modal 
                    isActive={isEditingToken}
                    head={(
                      <>
                        <h5>API Token Permissions</h5>
                        <button className="btn-close" onClick={handleUpdateApiTokenModal(false)}></button>
                      </>
                    )}
                    footer={(
                      <>
                        <button type="button" className="btn btn-sm btn-secondary" onClick={handleUpdateApiTokenModal(false)}>Nevermind</button>
                        <button type="submit" className="btn btn-sm btn-primary" form="update-api-token-form">Confirm</button>
                      </>
                    )}
                  >
                    <form id="update-api-token-form" onSubmit={handleUpdateApiTokenSubmit(onUpdateApiToken)} noValidate="">
                      <input type="hidden" name="token_id" ref={updateApiTokenRegister} />
                      {availablePermissions.map((permission) => (
                        <div className="form-check form-check-inline" key={`update-api-token-${permission}`}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="permissions"
                            id={`update-api-token-${permission}`}
                            value={permission}
                            ref={updateApiTokenRegister}
                          />
                          <label className="form-check-label" htmlFor={`update-api-token-${permission}`}>
                            {permission.charAt(0).toUpperCase() + permission.slice(1)}
                          </label>
                        </div>
                      ))}
                    </form>
                  </Modal>

                  <Modal 
                    isActive={willDeleteToken && isDeletingToken}
                    head={(
                      <>
                        <h5>Delete API Token</h5>
                        <button className="btn-close" onClick={handleDeleteApiTokenModal(false)}></button>
                      </>
                    )}
                    footer={(
                      <>
                        <button type="button" className="btn btn-sm btn-secondary" onClick={handleDeleteApiTokenModal(false)}>Nevermind</button>
                        <button type="button" className="btn btn-sm btn-primary" onClick={handleDeleteApiToken}>Confirm</button>
                      </>
                    )}
                  >
                    <div>
                      Are you sure you would like to delete this API ({willDeleteToken && willDeleteToken.name}) token? 
                    </div>
                  </Modal>
                  
                  {/* Token List */}
                  {[...tokens].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map((token) => (
                    <div className="d-flex justify-content-between py-2" key={token.id}>
                      <div>{token.name}</div>
                      <div className="d-inline-flex align-items-center">
                        <button
                          className="btn btn-sm btn-light me-1"
                          type="button"
                          onClick={handleUpdateApiTokenPermissions(token)}
                        >
                          Permissions
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={handleChangeDeleteApiToken(token)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </>
  );
};

Index.layout = page => (<AppLayout children={page} title="API Tokens" />);
export default Index;