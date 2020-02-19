export interface StorageAccount {
  primaryEndpoints: { [key: string]: string };
  primaryLocation: string;
  provisioningState: string;
  secondaryLocation: string;
  statusOfPrimary: string;
  statusOfSecondary: string;
}

export interface StorageAccountKeys {
  keys: StorageAccountKey[];
}

export interface StorageAccountKey {
  keyName: string;
  value: string;
  permissions: StorageAccountKeyPermission;
}

export enum StorageAccountKeyPermission {
  Full = 'FULL',
  ReadOnly = 'READ',
}
