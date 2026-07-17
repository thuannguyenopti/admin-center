export interface Role {
  id: string;
  name: string;
  type: 'group' | 'user' | 'vt';
  permissions: {
    read: boolean;
    create: boolean;
    change: boolean;
    delete: boolean;
    publish: boolean;
    administer: boolean;
  };
  avatar?: string;
  avatarBg?: string;
  templateName?: string;
  vtId?: string;
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
  {
    id: 'vt-frank',
    name: 'Frank',
    type: 'vt',
    vtId: 'frank',
    templateName: 'SEO Expert',
    avatar: '/avatars/vau-frank.png',
    avatarBg: '#E8F0FA',
    permissions: {
      read: true,
      create: false,
      change: true,
      delete: false,
      publish: true,
      administer: false,
    },
  },
  {
    id: 'vt-henry',
    name: 'Henry',
    type: 'vt',
    vtId: 'henry',
    templateName: 'Product Marketer',
    avatar: '/avatars/vau-henry.png',
    avatarBg: '#FAF6E8',
    permissions: {
      read: true,
      create: false,
      change: true,
      delete: false,
      publish: false,
      administer: false,
    },
  },
];
