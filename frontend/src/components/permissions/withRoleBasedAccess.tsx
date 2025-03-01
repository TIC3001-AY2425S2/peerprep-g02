import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import usePermissions from '../../hooks/usePermissions';

const withRoleBasedAccess = (
  WrappedComponent: React.FC,
  resource: string,
  action: 'create' | 'read' | 'update' | 'delete',
) => {
  const RoleBasedComponent = (props: any) => {
    const { checkPermission } = usePermissions();
    const navigate = useNavigate();

    useEffect(() => {
      if (!checkPermission(resource, action)) {
        console.log('No permission. Redirecting to home page...');
        navigate('/home');
      }
    }, [navigate, resource, action, checkPermission]);

    return <WrappedComponent {...props} />;
  };
  return RoleBasedComponent;
};

export default withRoleBasedAccess;
