import React from 'react';
import { Tab, Tablist } from 'evergreen-ui';

const tabs = [
  {
    label: 'Overview',
    href: 'overview',
  },
  {
    label: 'Settings',
    href: 'settings',
  },
];

const DeviceRegistrationToken = () => {
  const navigation = useNavigation();

  return (
    <Tablist border="default">
      {tabs.map(tab => (
        <Tab
          key={tab.href}
          id={tab.href}
          onSelect={() =>
            navigation.navigate(
              `/${projectName}/provisioning/deviceregistrationtokens/${tokenName}/${tab.href}`
            )
          }
          isSelected={false}
        >
          {tab.label}
        </Tab>
      ))}
    </Tablist>
  );
};

export default DeviceRegistrationToken;
