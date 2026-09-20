import React from 'react';
import DisplayPanel from './DisplayPanel';
import Keypad from './Keypad';
import MDI from './MDI';

/**
 * @param {{ state: object, actions: object }} props
 * @returns {JSX.Element}
 */
function Axes(props) {
  const { state, actions } = props;

  return (
    <div>
      <DisplayPanel
        canClick={state.canClick}
        units={state.units}
        axes={state.axes}
        machinePosition={state.machinePosition}
        workPosition={state.workPosition}
        positionInput={state.positionInput}
        onPositionInputChange={actions.setPositionInput}
        jog={state.jog}
        actions={actions}
        controllerType={state.controller.type}
      />
      <Keypad
        canClick={state.canClick}
        units={state.units}
        axes={state.axes}
        jog={state.jog}
        actions={actions}
      />
      <MDI
        canClick={state.canClick}
        mdi={state.mdi}
      />
    </div>
  );
}

export default Axes;
