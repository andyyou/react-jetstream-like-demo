import React, { useRef, useEffect } from 'react';
import { Modal as BSModal } from 'bootstrap';

const Modal = ({
  isActive,
  head,
  children,
  footer,
}) => {
  const el = useRef(null);
  const modal = useRef(null);

  useEffect(() => {
    modal.current = new BSModal(el.current, {
      backdrop: 'static',
    });
  }, []);

  useEffect(() => {
    if (!modal.current) {
      return;
    }
    if (isActive) {
      modal.current.show();
    } else {
      modal.current.hide();
    }
  }, [isActive]);

  return (
    <>
      <div className="modal fade" tabIndex="-1" ref={el}>
        <div className="modal-dialog">
          <div className="modal-content">
            {head && (
              <div className="modal-header">
                {head}
              </div>
            )}
            
            <div className="modal-body">
              {children}
            </div>

            {footer && (
              <div className="modal-footer">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;