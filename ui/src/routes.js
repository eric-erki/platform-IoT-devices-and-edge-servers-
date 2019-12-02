import {
  lazy,
  mount,
  route,
  redirect,
  map,
  compose,
  withView,
  withData,
} from 'navi';

import store from './store';
import api from './api';

const authenticate = routes => {
  return mount({
    '*': map((request, context) => {
      const { user } = store.getState();
      if (user) {
        return routes;
      } else {
        return redirect(
          `/login${
            request.path
              ? `?redirectTo=${encodeURIComponent(
                  request.mountpath + request.search
                )}`
              : ''
          }`
        );
      }
    }),
  });
};

export default mount({
  '/': redirect('/projects'),

  '/signup': route({
    title: 'Sign up',
    getView: () => import('./containers/signup'),
  }),
  '/login': route({
    title: 'Log in',
    getView: () => import('./containers/login'),
  }),
  '/forgot': route({
    title: 'Reset password',
    getView: () => import('./containers/password-reset'),
  }),
  '/recover/:token': route({
    title: 'Recover password',
    getData: ({ params }) => ({ params }),
    getView: () => import('./containers/password-recovery'),
  }),
  '/confirm/:token': route({
    title: 'Confirmation',
    getView: () => import('./containers/confirm'),
  }),
  '/projects': compose(
    withData(request => ({ params: request.params })),
    authenticate(
      mount({
        '/': route({
          title: 'Projects',
          getData: async () => {
            const projects = await api.projects();
            return {
              projects,
            };
          },
          getView: () => import('./containers/projects'),
        }),
        '/create': route({
          title: 'Create Project',
          getView: () => import('./containers/create-project'),
        }),
      })
    )
  ),

  '/:project': compose(
    withData(request => ({ params: request.params })),
    authenticate(
      mount({
        '/': redirect('devices'),
        '/devices': mount({
          '/': route({
            title: 'Devices',
            getData: async request => {
              const response = await api.devices({
                projectId: request.params.project,
              });

              return {
                devices: response.data,
              };
            },
            getView: () => import('./containers/devices'),
          }),
          '/add': route({
            title: 'Add Device',
            getData: async request => {
              const response = await api.defaultDeviceRegistrationToken({
                projectId: request.params.project,
              });

              return {
                deviceRegistrationToken: response.data,
              };
            },
            getView: () => import('./containers/device/add'),
          }),
          '/:device': compose(
            withView(() => import('./containers/device/index')),
            withData(async request => {
              const response = await api.device({
                projectId: request.params.project,
                deviceId: request.params.device,
              });

              return {
                device: response.data,
              };
            }),
            mount({
              '/': redirect('overview'),
              '/overview': route({
                title: 'Device Overview',
                getView: () => import('./containers/device/overview'),
              }),
              '/ssh': route({
                title: 'Device SSH',
                getView: () => import('./containers/device/ssh'),
              }),
              '/settings': route({
                title: 'Device Settings',
                getView: () => import('./containers/device/settings'),
              }),
            })
          ),
        }),
        '/iam': compose(
          withView(() => import('./containers/iam')),
          mount({
            '/': redirect('members'),
            '/members': mount({
              '/': route({
                title: 'Members',
                getData: async request => {
                  const response = await api.memberships({
                    projectId: request.params.project,
                  });
                  return {
                    members: response.data,
                  };
                },
                getView: () => import('./containers/iam/members'),
              }),
              '/:user': route({
                title: 'Member',
                getData: async request => {
                  const { data: member } = await api.membership({
                    projectId: request.params.project,
                    userId: request.params.user,
                  });
                  const { data: roles } = await api.roles({
                    projectId: request.params.project,
                  });
                  return {
                    member,
                    roles,
                  };
                },
                getView: () => import('./containers/iam/member'),
              }),
              '/add': route({
                title: 'Add member',
                getData: async request => {
                  const response = await api.roles({
                    projectId: request.params.project,
                  });
                  return {
                    roles: response.data,
                  };
                },
                getView: () => import('./containers/iam/add-member'),
              }),
            }),
            '/roles': mount({
              '/': route({
                title: 'Roles',
                getData: async request => {
                  const response = await api.roles({
                    projectId: request.params.project,
                  });
                  return {
                    roles: response.data,
                  };
                },
                getView: () => import('./containers/iam/roles'),
              }),
              '/:role': route({
                title: 'Role',
                getData: async request => {
                  const response = await api.role({
                    projectId: request.params.project,
                    roleId: request.params.role,
                  });
                  return {
                    role: response.data,
                  };
                },
                getView: () => import('./containers/iam/role'),
              }),
              '/create': route({
                title: 'Create role',
                getView: () => import('./containers/iam/create-role'),
              }),
            }),
            '/service-accounts': mount({
              '/': route({
                title: 'Service accounts',
                getData: async request => {
                  const response = await api.serviceAccounts({
                    projectId: request.params.project,
                  });
                  return {
                    serviceAccounts: response.data,
                  };
                },
                getView: () => import('./containers/iam/service-accounts'),
              }),
              '/:serviceName': route({
                title: 'Service account',
                getView: () => import('./containers/iam/service-account'),
              }),
              '/create': route({
                title: 'Create service account',
                getView: () =>
                  import('./containers/iam/create-service-account'),
              }),
            }),
          })
        ),
        '/applications': mount({
          '/': route({
            title: 'Applications',
            getData: async request => {
              const response = await api.applications({
                projectId: request.params.project,
              });

              return {
                applications: response.data,
              };
            },
            getView: () => import('./containers/applications'),
          }),
          '/create': route({
            title: 'Create Application',
            getView: () => import('./containers/create-application'),
          }),
          '/:application': route({}),
          '/:application/deploy': route({}),
        }),
        '/provisioning': mount({
          '/': route({
            title: 'Provisioning',
            getData: async request => {
              const response = await api.deviceRegistrationTokens({
                projectId: request.params.project,
              });

              return {
                deviceRegistrationTokens: response.data,
              };
            },
            getView: () => import('./containers/provisioning'),
          }),
          '/device-registration-tokens': mount({
            '/:token': route({}),
            '/create': route({}),
          }),
        }),
        '/settings': route({
          title: 'Project Settings',
          getView: () => import('./containers/project-settings'),
        }),
      })
    )
  ),
});
