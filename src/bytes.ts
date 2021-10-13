export enum DuteDataType {
  S8,
  S16,
  S32,
  U8,
  U16,
  U32,
}

export function getBytes(value: number, dataType: DuteDataType): number[] {
  switch (dataType) {
    case DuteDataType.S8: {
      const buffer = new ArrayBuffer(1);

      const view = new DataView(buffer);
      view.setInt8(0, value);

      return Array.from(new Int8Array(buffer));
    }

    case DuteDataType.S16: {
      const buffer = new ArrayBuffer(2);

      const view = new DataView(buffer);
      view.setInt16(0, value, true);

      return Array.from(new Int8Array(buffer));
    }

    case DuteDataType.S32: {
      const buffer = new ArrayBuffer(4);

      const view = new DataView(buffer);
      view.setInt32(0, value, true);

      return Array.from(new Int8Array(buffer));
    }

    case DuteDataType.U8: {
      const buffer = new ArrayBuffer(1);

      const view = new DataView(buffer);
      view.setUint8(0, value);

      return Array.from(new Uint8Array(buffer));
    }

    case DuteDataType.U16: {
      const buffer = new ArrayBuffer(2);

      const view = new DataView(buffer);
      view.setUint16(0, value, true);

      return Array.from(new Uint8Array(buffer));
    }

    case DuteDataType.U32: {
      const buffer = new ArrayBuffer(4);

      const view = new DataView(buffer);
      view.setUint32(0, value, true);

      return Array.from(new Uint8Array(buffer));
    }

    default:
      return [];
  }
}
