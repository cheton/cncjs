import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button,
  ButtonGroup,
  Flex,
  Space,
} from '@tonic-ui/react';
import React, { Component } from 'react';
import controller from '@app/lib/controller';
import i18n from '@app/lib/i18n';

class QuickAccessToolbar extends Component {
  command = {
    'cycle_start': () => {
      controller.command('cycle_start');
    },
    'feed_hold': () => {
      controller.command('feed_hold');
    },
    'homing': () => {
      controller.command('homing');
    },
    'sleep': () => {
      controller.command('sleep');
    },
    'unlock': () => {
      controller.command('unlock');
    },
    'reset': () => {
      controller.command('reset');
    }
  };

  render() {
    return (
      <Flex alignItems="center">
        <ButtonGroup>
          <Button
            variant="default"
            onClick={this.command.cycle_start}
            title={i18n._('Cycle Start')}
          >
            <FontAwesomeIcon icon="redo-alt" />
            <Space width={8} />
            {i18n._('Cycle Start')}
          </Button>
          <Button
            variant="default"
            onClick={this.command.feed_hold}
            title={i18n._('Feedhold')}
          >
            <FontAwesomeIcon icon="hand-paper" />
            <Space width={8} />
            {i18n._('Feedhold')}
          </Button>
        </ButtonGroup>
        <Space width={12} />
        <ButtonGroup>
          <Button
            variant="primary"
            onClick={this.command.homing}
            title={i18n._('Homing')}
          >
            <FontAwesomeIcon icon="home" />
            <Space width={8} />
            {i18n._('Homing')}
          </Button>
          <Button
            variant="default"
            onClick={this.command.sleep}
            title={i18n._('Sleep')}
          >
            <FontAwesomeIcon icon="bed" />
            <Space width={8} />
            {i18n._('Sleep')}
          </Button>
          <Button
            variant="default"
            onClick={this.command.unlock}
            title={i18n._('Unlock')}
          >
            <FontAwesomeIcon icon="unlock-alt" />
            <Space width={8} />
            {i18n._('Unlock')}
          </Button>
          <Button
            variant="emphasis"
            onClick={this.command.reset}
            title={i18n._('Reset')}
          >
            <FontAwesomeIcon icon="undo" />
            <Space width={8} />
            {i18n._('Reset')}
          </Button>
        </ButtonGroup>
      </Flex>
    );
  }
}

export default QuickAccessToolbar;
