import React from 'react';
import AppLayout from '@/layouts/AppLayout';

const Dashboard = (props) => {
  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          Dashboard
        </div>
      </div>
    </div>
  );
};

Dashboard.layout = page => <AppLayout children={page} />
export default Dashboard;