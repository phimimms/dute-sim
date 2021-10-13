export enum Request {
  ERROR_CODE = 'ERROR_CODE',
  METADATA = 'METADATA',
}

export const RequestMessage: Record<string, readonly number[]> = {
  [Request.ERROR_CODE]: [ 0x31, 0xFF, 0x06, 0x29 ],
  [Request.METADATA]: [ 0x31, 0xFF, 0x23, 0x35 ],
} as const;
