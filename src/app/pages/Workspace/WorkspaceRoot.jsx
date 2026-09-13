import React from 'react';
import { WidgetUIProvider } from './WidgetUIProvider';
import WorkspacePage from './Workspace';

const WorkspaceRoot = props => (
  <WidgetUIProvider>
    <WorkspacePage {...props} />
  </WidgetUIProvider>
);

export default WorkspaceRoot;
