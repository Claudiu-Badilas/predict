export type HeaderCardInput = {
  sections: CardSection[];
};

export type CardSection = {
  label: string;
  value: string | number | null;
  default: string | number | null;
  color: 'red' | 'green' | null;
};
