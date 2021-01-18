import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import Modal from '@/components/Modal';

const ConfirmsPassword = ({
  id,
  children,
  onConfirmed,
}) => {
  const [isActive, setIsActive] = useState(false);

  const handleActive = (active) => {
    return (e) => {
      e.preventDefault();
      if (active) {
        axios.get(route('password.confirmation'))
          .then(response => {
            if (response.data.confirmed) {
              onConfirmed();
            } else {
              setIsActive(true);
            }
          });
      } else {
        setIsActive(false);
      }
    };
  };

  const {
    register,
    handleSubmit,
    setError,
    errors,
  } = useForm();

  const submit = (data) => {
    axios.post(route('password.confirm'), {
      ...data,
    }).then(response => {
      onConfirmed();
      setIsActive(false);
    }).catch(error => {
      const {
        response: {
          data: {
            errors,
          },
        },
      } = error;
      if (errors.password) {
        setError('password', {
          message: errors.password[0],
        });
      }
    });
  };

  return (
    <>
      {React.isValidElement(children) && React.cloneElement(children, {
        onClick: handleActive(true),
      })}

      <Modal
        isActive={isActive}
        head={(
          <>
            <h5>Confirm Password</h5>
            <button className="btn-close" onClick={handleActive(false)}></button>
          </>
        )}
        footer={(
          <>
            <button type="button" className="btn btn-sm btn-secondary" onClick={handleActive(false)}>Nevermind</button>
            <button type="submit" className="btn btn-sm btn-primary" form={`${id}-confirms-password-form`}>Confirm</button>
          </>
        )}
      >
        <>
          <div>For your security, please confirm your password to continue.</div>
          <form id={`${id}-confirms-password-form`} onSubmit={handleSubmit(submit)} noValidate="">
            <div className="mb-3">
              <label htmlFor="password" className={['form-label', errors.password ? 'is-invalid' : ''].join(' ')}>New Password</label>
              <input type="password" className="form-control" id="password" name="password" ref={register} />
              {errors.password && (
                <div className="invalid-feedback">
                  {errors.password.message}
                </div>
              )}
            </div>
          </form>
        </>
      </Modal>
    </>
  );
};

export default ConfirmsPassword;