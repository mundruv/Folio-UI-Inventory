import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'react-final-form';
import { FormattedMessage } from 'react-intl';

import { Select } from '@folio/stripes/components';

import RepeatableField from '../components/RepeatableField';

const renderInstanceFormatField = ({ field, fieldIndex, canEdit }, instanceFormats) => {
  const instanceFormatOptions = instanceFormats
    ? instanceFormats.map(it => ({
      label: it.name,
      value: it.id,
    }))
    : [];

  const label = fieldIndex === 0 ? <FormattedMessage id="ui-inventory.instanceFormat" /> : null;

  return (
    <FormattedMessage id="ui-inventory.selectInstanceFormat">
      {([placeholder]) => (
        <Field
          label={label}
          name={field}
          title={field}
          component={Select}
          placeholder={placeholder}
          dataOptions={instanceFormatOptions}
          data-test-instance-format-field-count={fieldIndex}
          disabled={!canEdit}
        />
      )}
    </FormattedMessage>
  );
};

renderInstanceFormatField.propTypes = {
  field: PropTypes.object,
  fieldIndex: PropTypes.number,
  canEdit: PropTypes.bool,
};
renderInstanceFormatField.defaultProps = {
  canEdit: true,
};

const InstanceFormatFields = props => {
  const {
    instanceFormats,
    canAdd,
    canEdit,
    canDelete,
  } = props;

  return (
    <RepeatableField
      name="instanceFormatIds"
      label={<FormattedMessage id="ui-inventory.instanceFormats" />}
      addLabel={<FormattedMessage id="ui-inventory.addInstanceFormat" />}
      addButtonId="clickable-add-instanceformat"
      template={[{
        render(fieldObj) { return renderInstanceFormatField({ ...fieldObj, canEdit }, instanceFormats); },
      }]}
      canAdd={canAdd}
      canDelete={canDelete}
    />
  );
};

InstanceFormatFields.propTypes = {
  instanceFormats: PropTypes.arrayOf(PropTypes.object),
  canAdd: PropTypes.bool,
  canEdit: PropTypes.bool,
  canDelete: PropTypes.bool,
};
InstanceFormatFields.defaultProps = {
  canAdd: true,
  canEdit: true,
  canDelete: true,
};

export default InstanceFormatFields;
