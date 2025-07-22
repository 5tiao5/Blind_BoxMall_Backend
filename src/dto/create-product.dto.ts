// dto/create-product.dto.ts
export class CreateBlindBoxDTO {
  name: string;
  image: string;
  probability: number;
  serialNumber: string;
}

export class CreateProductDTO {
  name: string;
  description: string;
  image: string;
  price: number;
  rules: string;
  blindBoxItems: CreateBlindBoxDTO[];
}
