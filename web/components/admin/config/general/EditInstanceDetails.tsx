import React, { useState, useContext, useEffect } from 'react';
import { Button, Typography } from 'antd';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import CodeMirror from '@uiw/react-codemirror';
import { bbedit } from '@uiw/codemirror-theme-bbedit';
import { languages } from '@codemirror/language-data';
import {
  TextFieldWithSubmit,
  TEXTFIELD_TYPE_TEXTAREA,
  TEXTFIELD_TYPE_URL,
} from '../../TextFieldWithSubmit';
import { ServerStatusContext } from '../../../../utils/server-status-context';
import {
  postConfigUpdateToAPI,
  TEXTFIELD_PROPS_INSTANCE_URL,
  TEXTFIELD_PROPS_SERVER_NAME,
  TEXTFIELD_PROPS_SERVER_SUMMARY,
  TEXTFIELD_PROPS_SERVER_OFFLINE_MESSAGE,
  API_YP_SWITCH,
  FIELD_PROPS_YP,
  FIELD_PROPS_NSFW,
  FIELD_PROPS_HIDE_VIEWER_COUNT,
  API_SERVER_OFFLINE_MESSAGE,
  FIELD_PROPS_DISABLE_SEARCH_INDEXING,
} from '../../../../utils/config-constants';
import { UpdateArgs } from '../../../../types/config-section';
import { ToggleSwitch } from '../../ToggleSwitch';
import { EditLogo } from '../../EditLogo';
import FormStatusIndicator from '../../FormStatusIndicator';
import { createInputStatus, STATUS_SUCCESS } from '../../../../utils/input-statuses';

const { Title } = Typography;

// eslint-disable-next-line react/function-component-definition
export default function EditInstanceDetails() {
  const [formDataValues, setFormDataValues] = useState(null);
  const serverStatusData = useContext(ServerStatusContext);
  const { serverConfig } = serverStatusData || {};

  const { instanceDetails, yp, hideViewerCount, disableSearchIndexing } = serverConfig;
  const { instanceUrl } = yp;

  const [offlineMessageSaveStatus, setOfflineMessageSaveStatus] = useState(null);

  useEffect(() => {
    setFormDataValues({
      ...instanceDetails,
      ...yp,
      hideViewerCount,
      disableSearchIndexing,
    });
  }, [instanceDetails, yp]);

  if (!formDataValues) {
    return null;
  }

  // if instanceUrl is empty, we should also turn OFF the `enabled` field of directory.
  const handleSubmitInstanceUrl = () => {
    if (formDataValues.instanceUrl === '') {
      if (yp.enabled === true) {
        postConfigUpdateToAPI({
          apiPath: API_YP_SWITCH,
          data: { value: false },
        });
      }
    }
  };

  const handleSaveOfflineMessage = () => {
    postConfigUpdateToAPI({
      apiPath: API_SERVER_OFFLINE_MESSAGE,
      data: { value: formDataValues.offlineMessage },
    });
    setOfflineMessageSaveStatus(createInputStatus(STATUS_SUCCESS));
    setTimeout(() => {
      setOfflineMessageSaveStatus(null);
    }, 2000);
  };

  const handleFieldChange = ({ fieldName, value }: UpdateArgs) => {
    setFormDataValues({
      ...formDataValues,
      [fieldName]: value,
    });
  };

  function handleHideViewerCountChange(enabled: boolean) {
    handleFieldChange({ fieldName: 'hideViewerCount', value: enabled });
  }

  function handleDisableSearchEngineIndexingChange(enabled: boolean) {
    handleFieldChange({ fieldName: 'disableSearchIndexing', value: enabled });
  }

  const hasInstanceUrl = instanceUrl !== '';

  return (
    <div className="edit-general-settings">
      <Title level={3} className="section-title">
        Configure Instance Details
      </Title>
      <br />

      <TextFieldWithSubmit
        fieldName="name"
        {...TEXTFIELD_PROPS_SERVER_NAME}
        value={formDataValues.name}
        initialValue={instanceDetails.name}
        onChange={handleFieldChange}
      />

      <TextFieldWithSubmit
        fieldName="instanceUrl"
        {...TEXTFIELD_PROPS_INSTANCE_URL}
        value={formDataValues.instanceUrl}
        initialValue={yp.instanceUrl}
        type={TEXTFIELD_TYPE_URL}
        onChange={handleFieldChange}
        onSubmit={handleSubmitInstanceUrl}
      />

      <TextFieldWithSubmit
        fieldName="summary"
        {...TEXTFIELD_PROPS_SERVER_SUMMARY}
        type={TEXTFIELD_TYPE_TEXTAREA}
        value={formDataValues.summary}
        initialValue={instanceDetails.summary}
        onChange={handleFieldChange}
      />

      <div style={{ marginBottom: '50px', marginRight: '150px' }}>
        <div
          style={{
            display: 'flex',
            width: '80vh',
            justifyContent: 'space-between',
            alignItems: 'end',
          }}
        >
          <p style={{ margin: '20px', marginRight: '10px', fontWeight: '400' }}>Offline Message:</p>
          <CodeMirror
            value={formDataValues.offlineMessage}
            {...TEXTFIELD_PROPS_SERVER_OFFLINE_MESSAGE}
            theme={bbedit}
            height="150px"
            width="450px"
            onChange={value => {
              handleFieldChange({ fieldName: 'offlineMessage', value });
            }}
            extensions={[markdown({ base: markdownLanguage, codeLanguages: languages })]}
          />
        </div>
        <div className="field-tip">
          The offline message is displayed to your page visitors when you&apos;re not streaming.
          Markdown is supported.
        </div>

        <Button
          type="primary"
          onClick={handleSaveOfflineMessage}
          style={{ margin: '10px', float: 'right' }}
        >
          Save Message
        </Button>
        <FormStatusIndicator status={offlineMessageSaveStatus} />
      </div>

      {/* Logo section */}
      <EditLogo />

      <ToggleSwitch
        fieldName="hideViewerCount"
        useSubmit
        {...FIELD_PROPS_HIDE_VIEWER_COUNT}
        checked={formDataValues.hideViewerCount}
        onChange={handleHideViewerCountChange}
      />

      <ToggleSwitch
        fieldName="disableSearchIndexing"
        useSubmit
        {...FIELD_PROPS_DISABLE_SEARCH_INDEXING}
        checked={formDataValues.disableSearchIndexing}
        onChange={handleDisableSearchEngineIndexingChange}
      />

      <br />
      <p className="description">
        Increase your audience by appearing in the{' '}
        <a href="https://directory.owncast.online" target="_blank" rel="noreferrer">
          <strong>Owncast Directory</strong>
        </a>
        . This is an external service run by the Owncast project.{' '}
        <a
          href="https://owncast.online/docs/directory/?source=admin"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more
        </a>
        .
      </p>
      {!yp.instanceUrl && (
        <p className="description">
          You must set your <strong>Server URL</strong> above to enable the directory.
        </p>
      )}

      <div className="config-yp-container">
        <ToggleSwitch
          fieldName="enabled"
          useSubmit
          {...FIELD_PROPS_YP}
          checked={formDataValues.enabled}
          disabled={!hasInstanceUrl}
        />
        <ToggleSwitch
          fieldName="nsfw"
          useSubmit
          {...FIELD_PROPS_NSFW}
          checked={formDataValues.nsfw}
          disabled={!hasInstanceUrl}
        />
      </div>
    </div>
  );
}
