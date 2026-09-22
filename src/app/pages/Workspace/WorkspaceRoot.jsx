import React from 'react';
import { WorkspaceLayoutProvider } from './WorkspaceLayoutProvider';
import WorkspacePage from './Workspace';

const WorkspaceRoot = props => (
  <WorkspaceLayoutProvider>
    <WorkspacePage {...props} />
  </WorkspaceLayoutProvider>
);

export default WorkspaceRoot;
