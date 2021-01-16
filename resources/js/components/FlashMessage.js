import React, { useEffect, useState } from 'react';

const fadeOut = `
  @keyframes fade-out {
    0% { opacity: 1;}
    99% { opacity: 0.01 ;width: 100%; height: 100%;}
    100% { opacity: 0; width: 0; height: 0;}
  }
`;

const FlashMessage = ({
  duration,
  children,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let t;
    if (isVisible) {
      t = setTimeout(() => {
        setIsVisible(false);
      }, duration * 1000);
    }
    return () => {
      if (t) {
        clearTimeout(t);
      }
    }
  }, [isVisible]);

  return isVisible ? (
    <>
      <style children={fadeOut} />
      <span
        style={{
          animationDuration: `${duration}s`,
          animationIterationCount: 1,
          animationName: 'fade-out',
          animationTimingFunction: 'ease-out',
        }}
      >
        {children}
      </span>
    </>
  ) : null;
};

export default FlashMessage;