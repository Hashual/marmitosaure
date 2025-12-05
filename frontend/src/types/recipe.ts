export type Recipe = {
  _id: string;
  title: string;
  description: string;
  preparation_time: string;
  steps: string[];
  utensils: {
    name: string;
    type: string;
  }[];
  tags: string[];
  origin: string;
  author_id: string;
  image_url: string;
  creation_date: string;
};
