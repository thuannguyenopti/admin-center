export interface Role {
  id: string;
  name: string;
  type: 'group' | 'user';
  permissions: {
    read: boolean;
    create: boolean;
    change: boolean;
    delete: boolean;
    publish: boolean;
    administer: boolean;
  };
}

export const INITIAL_ROLES: Role[] = [
  {
    id: '1',
    name: 'Administrators',
    type: 'group',
    permissions: {
      read: true,
      create: true,
      change: true,
      delete: true,
      publish: true,
      administer: true,
    },
  },
  {
    id: '2',
    name: 'Content Editors',
    type: 'group',
    permissions: {
      read: true,
      create: true,
      change: true,
      delete: true,
      publish: false,
      administer: false,
    },
  },
  {
    id: '3',
    name: 'Site Admin',
    type: 'group',
    permissions: {
      read: true,
      create: true,
      change: false,
      delete: false,
      publish: false,
      administer: false,
    },
  },
  {
    id: '4',
    name: 'Everyone',
    type: 'group',
    permissions: {
      read: true,
      create: false,
      change: false,
      delete: false,
      publish: false,
      administer: false,
    },
  },
];
