import React from 'react';
import { InertiaLink } from '@inertiajs/inertia-react';

const Welcome = () => (
  <div>
    Welcome, Visit <InertiaLink href={route('dummy')}>Dummy</InertiaLink>
  </div>
);

export default Welcome;