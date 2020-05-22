import React, { useState } from 'react';
import DisplayTableWithEmptyMessage from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import moment from 'moment';
import { IGroup } from 'office-ui-fabric-react/lib/components/GroupedList/GroupedList.types';
import { DeploymentCenterCodeLogsProps, DateTimeObj, DeploymentStatus, DeploymentProperties } from '../DeploymentCenter.types';
import { ProgressIndicator, PanelType } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import CustomPanel from '../../../../components/CustomPanel/CustomPanel';
import { deploymentCenterLogs } from '../DeploymentCenter.styles';
import { ArmObj } from '../../../../models/arm-obj';

export function dateTimeComparatorReverse(a: DateTimeObj, b: DateTimeObj) {
  if (a.rawTime < b.rawTime) {
    return 1;
  }
  if (a.rawTime > b.rawTime) {
    return -1;
  }
  return 0;
}

const DeploymentCenterCodeLogs: React.FC<DeploymentCenterCodeLogsProps> = props => {
  const [isLogPanelOpen, setIsLogPanelOpen] = useState<boolean>(false);
  const { deployments, deploymentsError } = props;
  const { t } = useTranslation();

  const getStatusString = (status: DeploymentStatus, progressString: string) => {
    switch (status) {
      case DeploymentStatus.Building:
      case DeploymentStatus.Deploying:
        return progressString;
      case DeploymentStatus.Pending:
        return t('pending');
      case DeploymentStatus.Failed:
        return t('failed');
      case DeploymentStatus.Success:
        return t('success');
      default:
        return '';
    }
  };

  const rows = deployments
    ? deployments.value.map((deployment, index) => ({
        index: index,
        rawTime: moment(deployment.properties.received_time),
        displayTime: moment(deployment.properties.received_time).format('h:mm:ss A Z'),
        commit: React.createElement(
          'a',
          {
            href: '#' + deployment.properties.id,
            onClick: () => {
              showLogPanel(deployment);
            },
          },
          deployment.properties.id.substr(0, 7)
        ),
        checkinMessage: deployment.properties.message,
        status:
          getStatusString(deployment.properties.status, deployment.properties.progress) + (deployment.properties.active ? ' (Active)' : ''),
      }))
    : [];
  const items = rows.sort(dateTimeComparatorReverse);

  const columns = [
    { key: 'displayTime', name: t('time'), fieldName: 'displayTime', minWidth: 150 },
    { key: 'commit', name: t('commitId'), fieldName: 'commit', minWidth: 150 },
    { key: 'status', name: t('status'), fieldName: 'status', minWidth: 210 },
    { key: 'checkinMessage', name: t('checkinMessage'), fieldName: 'checkinMessage', minWidth: 210 },
  ];

  const groups: IGroup[] = [];
  let previousMoment: moment.Moment;
  items.forEach((item, index) => {
    if (index === 0 || !item.rawTime.isSame(previousMoment, 'day')) {
      const group = { key: 'Group' + groups.length, name: item.rawTime.format('dddd, MMMM D, YYYY'), startIndex: index, count: 1 };
      previousMoment = item.rawTime;
      groups.push(group);
    } else {
      groups[groups.length - 1].count += 1;
    }
  });

  const showLogPanel = (deployment: ArmObj<DeploymentProperties>) => {
    console.log(deployment);
    setIsLogPanelOpen(true);
  };
  const dismissLogPanel = () => {
    setIsLogPanelOpen(false);
  };

  return (
    <>
      {deploymentsError ? (
        <pre className={deploymentCenterLogs}>{deploymentsError}</pre>
      ) : deployments ? (
        <DisplayTableWithEmptyMessage columns={columns} items={items} selectionMode={0} groups={groups} />
      ) : (
        <ProgressIndicator
          description={t('deploymentCenterCodeDeploymentsLoading')}
          ariaValueText={t('deploymentCenterCodeDeploymentsLoadingAriaValue')}
        />
      )}
      <CustomPanel isOpen={isLogPanelOpen} onDismiss={dismissLogPanel} type={PanelType.medium} />
    </>
  );
};

export default DeploymentCenterCodeLogs;
