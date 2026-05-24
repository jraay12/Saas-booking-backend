export type CreateServiceDTO = {
  service_name: string;
  category: string;
  description?: string;
  price: number;
  hour: number;
  minute: number;
  image_path: string;
};

export type UpdateServiceDTO = Partial<CreateServiceDTO>;