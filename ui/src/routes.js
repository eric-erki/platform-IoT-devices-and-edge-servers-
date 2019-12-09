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
    title: 'Sign Up',
    getView: () => import('./containers/signup'),
  }),
  '/login': route({
    title: 'Log In',
    getView: () => import('./containers/login'),
  }),
  '/forgot': route({
    title: 'Reset Password',
    getView: () => import('./containers/password-reset'),
  }),
  '/recover/:token': route({
    title: 'Recover Password',
    getData: ({ params }) => ({ params }),
    getView: () => import('./containers/password-recovery'),
  }),
  '/confirm/:token': route({
    title: 'Confirmation',
    getData: ({ params }) => ({ params }),
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
          '/register': route({
            title: 'Register Device',
            getData: async request => {
              const response = await api.defaultDeviceRegistrationToken({
                projectId: request.params.project,
              });

              return {
                deviceRegistrationToken: response.data,
              };
            },
            getView: () => import('./containers/register-device'),
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
                title: 'Overview - Device',
                getView: () => import('./containers/device/overview'),
              }),
              '/ssh': route({
                title: 'SSH - Device',
                getView: () => import('./containers/device/ssh'),
              }),
              '/settings': route({
                title: 'Settings - Device',
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
                title: 'Add Member',
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
                title: 'Create Role',
                getView: () => import('./containers/iam/create-role'),
              }),
            }),
            '/service-accounts': mount({
              '/': route({
                title: 'Service Accounts',
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
              '/:service': route({
                title: 'Service Account',
                getData: async request => {
                  const { data: serviceAccount } = await api.serviceAccount({
                    projectId: request.params.project,
                    serviceId: request.params.service,
                  });
                  const { data: roles } = await api.roles({
                    projectId: request.params.project,
                  });
                  return {
                    serviceAccount,
                    roles,
                  };
                },
                getView: () => import('./containers/iam/service-account'),
              }),
              '/create': route({
                title: 'Create Service Account',
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
          '/:application': compose(
            withView(() => import('./containers/application')),
            withData(async request => {
              const response = await api.application({
                projectId: request.params.project,
                applicationId: request.params.application,
              });
              return {
                application: response.data,
              };
            }),
            mount({
              '/': redirect('overview'),
              '/overview': route({
                title: 'Overview - Application',
                getView: () => import('./containers/application/overview'),
              }),
              '/releases': mount({
                '/': route({
                  title: 'Releases - Application',
                  getData: async request => {
                    const response = await api.releases({
                      projectId: request.params.project,
                      applicationId: request.params.application,
                    });
                    return {
                      releases: response.data,
                    };
                  },
                  getView: () => import('./containers/application/releases'),
                }),
                '/create': route({
                  title: 'Create Release - Application',
                  getView: () =>
                    import('./containers/application/create-release'),
                }),
                '/:release': route({
                  title: 'Release - Application',
                  getView: () => import('./containers/application/release'),
                }),
              }),
              '/scheduling': route({
                title: 'Scheduling - Application',
                getView: () => import('./containers/application/scheduling'),
              }),
              '/settings': route({
                title: 'Settings - Application',
                getView: () => import('./containers/application/settings'),
              }),
            })
          ),
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
            '/create': route({
              title: 'Create Device Registration Token',
              getView: () =>
                import('./containers/create-device-registration-token'),
            }),
            '/:token': compose(
              withView(() => import('./containers/device-registration-token')),
              withData(async request => {
                const response = await api.deviceRegistrationToken({
                  projectId: request.params.project,
                  tokenId: request.params.token,
                });
                return {
                  deviceRegistrationToken: response.data,
                };
              }),
              mount({
                '/': redirect('overview'),
                '/overview': route({
                  title: 'Overview - Device Registration Token',
                  getView: () =>
                    import('./containers/device-registration-token/overview'),
                }),
                '/settings': route({
                  title: 'Settings - Device Registration Token',
                  getView: () =>
                    import('./containers/device-registration-token/settings'),
                }),
              })
            ),
          }),
        }),
        '/settings': route({
          title: 'Settings - Project',
          getData: async request => {
            const response = await api.project({
              projectId: request.params.project,
            });
            return {
              project: response.data,
            };
          },
          getView: () => import('./containers/project-settings'),
        }),
      })
    )
  ),
});
