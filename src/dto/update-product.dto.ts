export class UpdateBlindBoxItemDTO {
  id?: number; // 存在则更新，不存在则创建新盲盒
  name: string;
  image: string;
  probability: number;
  serialNumber: string;
}

export class UpdateProductDTO {
  id: number;
  name: string;
  image: string;
  description: string;
  price: number;
  rules: string;
  blindBoxItems: UpdateBlindBoxItemDTO[];
}
