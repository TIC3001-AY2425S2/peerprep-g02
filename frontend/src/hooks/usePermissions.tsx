import { getUser } from '../localStorage';

export type Role = 'admin' | 'normal';

interface Permissions {
  [key: string]: {
    [key in 'create' | 'read' | 'update' | 'delete']?: boolean;
  };
}

const rolePermissions: Record<Role, Permissions> = {
  admin: {
    question: { read: true, create: true, update: true, delete: true },
  },
  normal: {
    question: { read: true, create: false, update: false, delete: false },
  },
};

const usePermissions = () => {
  const user = getUser();
  const role = user.role;

  const checkPermission = (resource: string, action: 'create' | 'read' | 'update' | 'delete'): boolean => {
    const permissions = rolePermissions[role][resource] || {};
    return permissions[action] ?? false;
  };

  // Probably have a less specific way to do this since the difference is roles is quite simple
  const canUpdateQuestion = checkPermission('question', 'create');
  const canCreateQuestion = checkPermission('question', 'update');
  const canDeleteQuestion = checkPermission('question', 'delete');
  const canViewQuestion = checkPermission('question', 'read');

  return {
    checkPermission,
    canUpdateQuestion,
    canCreateQuestion,
    canDeleteQuestion,
    canViewQuestion,
  };
};

export default usePermissions;
