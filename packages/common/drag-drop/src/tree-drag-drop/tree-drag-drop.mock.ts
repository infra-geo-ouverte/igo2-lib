export interface ITREE_ITEM_MOCK {
  id: string;
  children?: ITREE_ITEM_MOCK[];
}

export const TREE_MOCK: ITREE_ITEM_MOCK[] = [
  {
    id: '1',
    children: [
      {
        id: '2',
        children: []
      }
    ]
  },
  {
    id: '3',
    children: []
  }
];
