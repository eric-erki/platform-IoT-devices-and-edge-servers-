import React from 'react';

import config from '../config';
import Card from './card';
import { Button } from './core';

const CliDownload = () => (
  <Card title="Download CLI" border>
    <Button
      title="MacOS"
      variant="secondary"
      marginBottom={3}
      href={`${config.cliEndpoint}/latest/darwin/amd64/deviceplane`}
    />
    <Button
      title="Windows"
      variant="secondary"
      marginBottom={3}
      href={`${config.cliEndpoint}/latest/windows/amd64/deviceplane.exe`}
    />
    <Button
      title="Linux AMD64"
      variant="secondary"
      marginBottom={3}
      href={`${config.cliEndpoint}/latest/linux/amd64/deviceplane`}
    />
    <Button
      title="Linux ARM"
      variant="secondary"
      marginBottom={3}
      href={`${config.cliEndpoint}/latest/linux/arm/deviceplane`}
    />
    <Button
      title="Linux ARM64"
      variant="secondary"
      marginBottom={3}
      href={`${config.cliEndpoint}/latest/linux/arm64/deviceplane`}
    />
  </Card>
);

export default CliDownload;
