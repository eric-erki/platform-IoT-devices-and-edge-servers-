import axios from 'axios';

import segment from './lib/segment';
import config from './config';

axios.defaults.withCredentials = true;

const url = path => `${config.endpoint}/${path}`;
const get = (path, ...rest) => axios.get(url(path), ...rest);
const post = (path, ...rest) => axios.post(url(path), ...rest);
const del = (path, ...rest) => axios.delete(url(path), ...rest);
const put = (path, ...rest) => axios.put(url(path), ...rest);
const patch = (path, ...rest) => axios.patch(url(path), ...rest);

const api = {
  login: ({ email, password }) => post('login', { email, password }),

  logout: () => post('logout'),

  signup: ({ email, password, firstName, lastName, company }) =>
    post(`register`, {
      email,
      password,
      firstName,
      lastName,
      company,
    }),

  resetPassword: ({ email }) => post('recoverpassword', { email }),

  verifyPasswordResetToken: ({ token }) =>
    get(`passwordrecoverytokens/${token}`),

  updatePassword: ({ token, password }) =>
    post('changepassword', {
      passwordRecoveryTokenValue: token,
      password,
    }),

  user: () => get('me'),

  updateUser: data => patch('me', data),

  project: ({ projectId }) => get(`projects/${projectId}`),

  projects: () =>
    get(`memberships?full`).then(({ data }) =>
      data.map(({ project }) => project)
    ),

  createProject: data =>
    post(`projects`, data).then(response => {
      segment.track('Project Created');

      return response;
    }),

  updateProject: ({ projectId, name, datadogApiKey }) =>
    put(`projects/${projectId}`, {
      name,
      datadogApiKey,
    }),

  deleteProject: ({ projectId }) => del(`projects/${projectId}`),

  devices: ({ projectId, queryString = '' }) =>
    get(`projects/${projectId}/devices${queryString}`),

  device: ({ projectId, deviceId }) =>
    get(`projects/${projectId}/devices/${deviceId}?full`),

  updateDevice: ({ projectId, deviceId, data: { name } }) =>
    patch(`projects/${projectId}/devices/${deviceId}`, { name }),

  deleteDevice: ({ projectId, deviceId }) =>
    del(`projects/${projectId}/devices/${deviceId}`),

  defaultDeviceRegistrationToken: ({ projectId }) =>
    get(`projects/${projectId}/deviceregistrationtokens/default`),

  deviceRegistrationToken: ({ projectId, tokenId }) =>
    get(`projects/${projectId}/deviceregistrationtokens/${tokenId}?full`),

  deviceRegistrationTokens: ({ projectId }) =>
    get(`projects/${projectId}/deviceregistrationtokens?full`),

  createDeviceRegistrationToken: ({
    projectId,
    data: { name, description, maxRegistrations },
  }) =>
    post(`projects/${projectId}/deviceregistrationtokens`, {
      name,
      description,
      maxRegistrations,
    }),

  updateDeviceRegistrationToken: ({
    projectId,
    name,
    description,
    maxRegistrations,
    settings,
  }) =>
    put(`projects/${projectId}/deviceregistrationtokens/${name}`, {
      name,
      description,
      maxRegistrations,
      settings,
    }),

  deleteDeviceRegistrationToken: ({ projectId, tokenId }) =>
    del(`projects/${projectId}/deviceregistrationtokens/${tokenId}`),

  applications: ({ projectId }) =>
    get(`projects/${projectId}/applications?full`),

  application: ({ projectId, applicationId }) =>
    get(`projects/${projectId}/applications/${applicationId}?full`),

  createApplication: ({ projectId, data: { name, description } }) =>
    post(`projects/${projectId}/applications`, { name, description }).then(
      response => {
        segment.track('Application Created');
        return response;
      }
    ),

  updateApplication: ({
    projectId,
    applicationId,
    data: { name, description, settings },
  }) =>
    put(`projects/${projectId}/applications/${applicationId}`, {
      name,
      description,
      settings,
    }),

  deleteApplication: ({ projectId, applicationId }) =>
    del(`projects/${projectId}/applications/${applicationId}`),

  roles: ({ projectId }) => get(`projects/${projectId}/roles`),

  role: ({ projectId, roleId }) => get(`projects/${projectId}/roles/${roleId}`),

  createRole: ({ project, role }) =>
    post(`projects/${project}/roles`, role).then(response => {
      segment.track('Role Created');
      return response;
    }),

  updateRole: ({ project, role: { id, ...data } }) =>
    put(`projects/${project}/roles/${id}`, data),

  deleteRole: ({ project, id }) => del(`projects/${project}/roles/${id}`),

  memberships: ({ projectId }) => get(`projects/${projectId}/memberships?full`),

  membership: ({ projectId, userId }) =>
    get(`projects/${projectId}/memberships/${userId}?full`),

  addMember: ({ projectId, data: { email } }) =>
    post(`projects/${projectId}/memberships`, { email }).then(response => {
      segment.track('Member Added');
      return response;
    }),

  removeMember: ({ projectId, userId }) =>
    del(`projects/${projectId}/memberships/${userId}`),

  addRoleBindings: ({ projectId, userId, roleId }) =>
    post(
      `projects/${projectId}/memberships/${userId}/roles/${roleId}/membershiprolebindings`
    ),

  removeRoleBindings: ({ projectId, userId, roleId }) =>
    del(
      `projects/${projectId}/memberships/${userId}/roles/${roleId}/membershiprolebindings`
    ),

  serviceAccounts: ({ projectId }) =>
    get(`projects/${projectId}/serviceaccounts?full`),

  createServiceAccount: ({ project, serviceAccount }) =>
    post(`projects/${project}/serviceaccounts`, serviceAccount).then(
      response => {
        segment.track('Service Account Created');
        return response;
      }
    ),

  releases: ({ projectId, applicationId }) =>
    get(`projects/${projectId}/applications/${applicationId}/releases?full`),

  createRelease: ({ projectId, applicationId, rawConfig }) =>
    post(`projects/${projectId}/applications/${applicationId}/releases`, {
      rawConfig,
    }).then(response => {
      segment.track('Release Created');
      return response;
    }),

  latestReleases: ({ projectId, applicationId }) =>
    get(`projects/${projectId}/applications/${applicationId}/releases/latest`),

  accessKeys: () => get(`useraccesskeys`),

  createAccessKey: () => post(`useraccesskeys`, {}),

  deleteAccessKey: ({ id }) => del(`useraccesskeys/${id}`),
};

export default api;
