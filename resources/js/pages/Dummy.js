import React from 'react';
import { InertiaLink } from '@inertiajs/inertia-react';

const Dummy = () => (
  <div>
    Dummy, Visit <InertiaLink href={route('home')}>Welcome</InertiaLink>
  </div>
);

export default Dummy;