import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@tonic-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import { Nav, NavItem } from '@app/components/Navs';
import i18n from '@app/lib/i18n';
import { useMdiQuery, useSaveMdiMutation } from '../queries';
import { createSettingsDraft, normalizeGeneral } from './draft';
import General from './General';
import MDI from './MDI';
import ShuttleXpress from './ShuttleXpress';

/**
 * @param {{
 *   config: { get: (key: string, fallback?: unknown) => unknown, set: (key: string, value: unknown) => void },
 *   onSave?: (event: Event) => void,
 *   onCancel?: (event: Event) => void
 * }} props
 * @returns {JSX.Element}
 */
function Settings({ config, onSave = () => {}, onCancel = () => {} }) {
  const mdiQuery = useMdiQuery();
  const saveMdi = useSaveMdiMutation();
  const saving = saveMdi.isPending ?? saveMdi.isLoading ?? false;
  const [activeKey, setActiveKey] = useState('general');
  const [draft, setDraft] = useState(() => ({
    ...createSettingsDraft(config),
    mdiRecords: null,
  }));
  const [error, setError] = useState(null);
  const submitLock = useRef(false);
  const mdiInitialized = useRef(false);

  useEffect(() => {
    if (mdiInitialized.current || !mdiQuery.data || !Array.isArray(mdiQuery.data.records)) {
      return;
    }

    mdiInitialized.current = true;
    setDraft(currentDraft => ({
      ...currentDraft,
      mdiRecords: mdiQuery.data.records.map(record => ({ ...record })),
    }));
  }, [mdiQuery.data]);

  const updateGeneral = general => setDraft(currentDraft => ({ ...currentDraft, general }));
  const updateShuttleXpress = shuttleXpress => setDraft(currentDraft => ({ ...currentDraft, shuttleXpress }));
  const updateMdiRecords = mdiRecords => setDraft(currentDraft => ({ ...currentDraft, mdiRecords }));
  const close = event => {
    if (!saving && !submitLock.current) {
      onCancel(event);
    }
  };
  const save = async (event) => {
    if (saving || submitLock.current || draft.mdiRecords === null) {
      return;
    }

    submitLock.current = true;
    setError(null);
    const snapshot = {
      general: {
        axes: [...draft.general.axes],
        imperialJogDistances: [...draft.general.imperialJogDistances],
        metricJogDistances: [...draft.general.metricJogDistances],
      },
      shuttleXpress: { ...draft.shuttleXpress },
      mdiRecords: draft.mdiRecords.map(record => ({ ...record })),
    };

    try {
      await saveMdi.mutateAsync({ records: snapshot.mdiRecords });
      const normalizedGeneral = normalizeGeneral(snapshot.general);

      config.set('axes', normalizedGeneral.axes);
      config.set('jog.imperial.distances', normalizedGeneral.imperialJogDistances);
      config.set('jog.metric.distances', normalizedGeneral.metricJogDistances);
      config.set('shuttle.feedrateMin', snapshot.shuttleXpress.feedrateMin);
      config.set('shuttle.feedrateMax', snapshot.shuttleXpress.feedrateMax);
      config.set('shuttle.hertz', snapshot.shuttleXpress.hertz);
      config.set('shuttle.overshoot', snapshot.shuttleXpress.overshoot);
      onSave(event);
    } catch (saveError) {
      setError(saveError);
    } finally {
      submitLock.current = false;
    }
  };

  const errorMessage = error?.message || i18n._('An unexpected error has occurred.');
  const mdiReady = draft.mdiRecords !== null && !mdiQuery.isLoading && !mdiQuery.isError;

  return (
    <Modal
      closeOnInteractOutside={false}
      isClosable={!saving}
      isOpen
      onClose={close}
      size="md"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{i18n._('Axes Settings')}</ModalHeader>
        <ModalBody padding={false}>
          <Nav
            navStyle="tabs"
            activeKey={activeKey}
            onSelect={setActiveKey}
            style={{ marginTop: 15, paddingLeft: 15 }}
          >
            <NavItem eventKey="general">{i18n._('General')}</NavItem>
            <NavItem eventKey="mdi">{i18n._('Custom Commands')}</NavItem>
            <NavItem eventKey="shuttleXpress">{i18n._('ShuttleXpress')}</NavItem>
          </Nav>
          <Box padding="2x 3x" minHeight="240px">
            {activeKey === 'general' && (
              <General value={draft.general} onChange={updateGeneral} />
            )}
            {activeKey === 'mdi' && (
              <>
                {mdiQuery.isError && (
                  <Box role="alert" color="danger" mb="2x">
                    {i18n._('An unexpected error has occurred.')}
                    <Button size="sm" onClick={() => mdiQuery.refetch()}>
                      {i18n._('Retry')}
                    </Button>
                  </Box>
                )}
                <MDI
                  records={draft.mdiRecords || []}
                  loading={mdiQuery.isLoading}
                  error={mdiQuery.isError}
                  onRecordsChange={updateMdiRecords}
                />
              </>
            )}
            {activeKey === 'shuttleXpress' && (
              <ShuttleXpress value={draft.shuttleXpress} onChange={updateShuttleXpress} />
            )}
            {error && (
              <Box role="alert" color="danger" mt="2x">
                {errorMessage}
              </Box>
            )}
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button disabled={saving} onClick={close}>
            {i18n._('Cancel')}
          </Button>
          <Button
            variant="primary"
            disabled={saving || !mdiReady}
            onClick={save}
          >
            {i18n._('Save Changes')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default Settings;
